import { z } from 'zod'

/** 일반 상품 카테고리 — 필수 enum (노션: 베이커리/음료/디저트). 태그·해시태그 X */
export const PRODUCT_CATEGORIES = ['베이커리', '음료', '디저트'] as const
export const productCategorySchema = z.enum(PRODUCT_CATEGORIES, {
  message: '카테고리를 선택해 주세요',
})
export type ProductCategory = z.infer<typeof productCategorySchema>

/**
 * 판매 상태 배지 구분. 일반 상품은 재고 수량이 없으므로(메뉴 정보 성격) onSale/offSale 만 사용.
 * soldOut 은 떨이(수량 소진) 컨텍스트용으로 카드가 함께 지원.
 */
export type ProductSaleStatus = 'onSale' | 'offSale' | 'soldOut'

/**
 * 일반 상품 도메인 모델 — `products` 테이블 row (노션: 일반 상품 등록).
 * 수량 컬럼 없음. 사진은 실연동 시 OCI URL, mock 은 dataURL.
 */
export interface Product {
  id: string
  storeId: string
  name: string
  category: ProductCategory
  /** 정상가 — 정수 KRW, 0 이상 */
  price: number
  description?: string
  /** 판매 여부 — 등록 시 토글 (default ON). OFF = 매장 상세 비노출(비공개) */
  onSale: boolean
  /** 대표 사진 — mock dataURL. 없으면 카드에서 이모지 폴백 */
  imageUrl?: string
}

/**
 * 상품 등록 폼 검증 스키마 (노션 정책·결정).
 * - price 는 숫자 입력을 문자열로 받아 검증 → 제출 시 Number() 변환 (transform 타입 꼬임 회피).
 * - 사진은 선택 입력이라 폼 zod 밖에서 별도 처리(File→dataURL).
 */
export const createProductInputSchema = z.object({
  name: z.string().trim().min(1, '상품명을 입력해 주세요').max(40, '40자 이내로 입력해 주세요'),
  category: productCategorySchema,
  price: z
    .string()
    .min(1, '정상가를 입력해 주세요')
    .regex(/^\d+$/, '0 이상의 정수로 입력해 주세요'),
  description: z.string().trim().max(200, '200자 이내로 입력해 주세요').optional(),
  onSale: z.boolean(),
})
export type CreateProductInput = z.infer<typeof createProductInputSchema>

/**
 * API 페이로드 — 폼값 정규화 결과 (price 숫자 변환, 빈 설명 제거, 사진 dataURL 합류).
 * mock 은 imageDataUrl 을 그대로 imageUrl 로 저장. 실연동 시 OCI 업로드로 교체.
 */
export interface CreateProductPayload {
  storeId: string
  name: string
  category: ProductCategory
  price: number
  description?: string
  onSale: boolean
  imageDataUrl?: string
}
