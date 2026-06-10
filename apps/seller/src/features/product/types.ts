import { z } from 'zod'

/** BE 카테고리 enum 전체 (상품 응답 포함 ETC) */
export const productCategorySchema = z.enum(['BAKERY', 'BEVERAGE', 'DESSERT', 'ETC'])
export type ProductCategory = z.infer<typeof productCategorySchema>

/**
 * 폼·필터 칩에 노출할 BE 카테고리 (ETC 제외 — 사장이 ETC 생성 수단 없음).
 * 순서 = 화면 표시 순서.
 */
export const PRODUCT_CATEGORIES = ['BAKERY', 'BEVERAGE', 'DESSERT'] as const

/** 카테고리 BE enum → 한국어 표시 라벨 */
export const CATEGORY_LABELS: Record<string, string> = {
  BAKERY: '베이커리',
  BEVERAGE: '음료',
  DESSERT: '디저트',
  ETC: '기타',
}

/**
 * 판매 상태 배지 구분. 일반 상품은 재고 수량이 없으므로(메뉴 정보 성격) onSale/offSale 만 사용.
 * soldOut 은 떨이(수량 소진) 컨텍스트용으로 카드가 함께 지원.
 */
export type ProductSaleStatus = 'onSale' | 'offSale' | 'soldOut'

/**
 * 일반 상품 도메인 모델 — `products` 테이블 row (노션: 일반 상품 등록).
 * 수량 컬럼 없음. 사진은 OCI URL.
 */
export interface Product {
  id: number
  storeId: number
  name: string
  category: ProductCategory
  /** 정상가 — 정수 KRW (BE regularPrice 매핑) */
  price: number
  description?: string
  /** 판매 여부 — BE status=ON_SALE 이면 true */
  onSale: boolean
  /** 대표 사진 URL */
  imageUrl?: string
}

/**
 * 상품 등록 폼 검증 스키마 (노션 정책·결정).
 * - price 는 숫자 입력을 문자열로 받아 검증 → 제출 시 Number() 변환.
 * - category 는 BE enum 값 저장, CATEGORY_LABELS 로 표시.
 * - 사진은 폼 zod 밖에서 별도 처리 (File 객체 → multipart).
 */
export const createProductInputSchema = z.object({
  name: z.string().trim().min(1, '상품명을 입력해 주세요').max(40, '40자 이내로 입력해 주세요'),
  category: z.enum(['BAKERY', 'BEVERAGE', 'DESSERT'], { message: '카테고리를 선택해 주세요' }),
  price: z
    .string()
    .min(1, '정상가를 입력해 주세요')
    .regex(/^\d+$/, '0 이상의 정수로 입력해 주세요'),
  description: z.string().trim().max(500, '500자 이내로 입력해 주세요').optional(),
  onSale: z.boolean(),
})
export type CreateProductInput = z.infer<typeof createProductInputSchema>

/**
 * API 페이로드 — 폼값 정규화 결과 (price 숫자 변환, 빈 설명 제거, 사진 File 합류).
 * create/update 모두 multipart/form-data 로 전송.
 */
export interface CreateProductPayload {
  storeId: number
  name: string
  category: 'BAKERY' | 'BEVERAGE' | 'DESSERT'
  price: number
  description?: string
  onSale: boolean
  /** 업로드할 이미지 파일 — 없으면 미전송 */
  imageFile?: File
}

/**
 * 상품 수정 페이로드 (노션: 일반 상품 수정/삭제). 등록과 동일 필드.
 * `imageFile` 은 사진 교체 시에만 — 없으면 기존 사진 유지.
 */
export type UpdateProductPayload = Omit<CreateProductPayload, 'storeId'>
