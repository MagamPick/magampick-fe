import { z } from 'zod'

/**
 * 상품 상세 조회 (소비자) 도메인 타입 (노션: 상품 상세 조회 (소비자), Phase 4).
 * 한 화면에서 상품 종류(일반 product / 떨이 clearance)로 분기 노출.
 * 일반/떨이는 BE 별도 데이터 모델(Phase 3 결정)이지만 본 화면은 진입 kind 로 분기.
 * 거리·영업상태·평점 등은 BE/DB 책임 — FE 는 응답을 렌더만 한다.
 */

/** 상품 종류 — deal(떨이/마감 할인) · menu(일반 상품) */
export const productKindSchema = z.enum(['deal', 'menu'])
export type ProductKind = z.infer<typeof productKindSchema>

/**
 * 매장 영업 상태 — 영업 외(BREAK/CLOSED_TODAY)면 담기 차단.
 * store-detail 와 동일 개념이나 feature 독립을 위해 로컬 정의(안정적 3값 enum).
 */
export const productBusinessStatusSchema = z.enum(['OPEN', 'BREAK', 'CLOSED_TODAY'])
export type ProductBusinessStatus = z.infer<typeof productBusinessStatusSchema>

/** 떨이 상태 — ACTIVE 만 구매 가능, 나머지(SOLD_OUT/EXPIRED/MANUAL)는 마감. BE는 ACTIVE/SOLD_OUT/EXPIRED 반환(MANUAL은 FE 상위집합) */
export const dealStatusSchema = z.enum(['ACTIVE', 'SOLD_OUT', 'EXPIRED', 'MANUAL'])
export type DealStatus = z.infer<typeof dealStatusSchema>

/** 일반/떨이 공통 노출 필드 */
const productCommon = {
  /** BE int64 → number */
  id: z.number(),
  /** 소속 매장 — 매장 상세로 이동 시 사용. BE int64 → number */
  storeId: z.number(),
  storeName: z.string().default(''),
  /** 직선거리(km) */
  distanceKm: z.number().default(0),
  businessStatus: productBusinessStatusSchema,
  /** 대표 사진 1장 (없으면 폴백) */
  imageUrl: z.string().nullish().transform((v) => v ?? null),
  name: z.string().default(''),
  /** 상품 설명 (선택 — 있으면 표시) */
  description: z.string().nullish().transform((v) => v ?? null),
  /** 상품 단위 평점 평균 */
  rating: z.number().default(0),
  /** 상품 단위 리뷰 개수 */
  reviewCount: z.number().int().default(0),
  /**
   * 매장 마감 시각 (HH:mm) — 장바구니 픽업 시간 슬롯 생성용.
   * BE 가 직접 제공. 오늘 휴무면 null.
   */
  closingTime: z.string().nullish().transform((v) => v ?? null),
}

/** 일반 상품(menu) — 정가 + 판매 여부 */
export const menuProductDetailSchema = z.object({
  ...productCommon,
  kind: z.literal('menu'),
  /** 정가 */
  price: z.number().default(0),
  /** 판매 여부 — OFF 면 담기 차단(정상 흐름엔 노출 X, 직접 링크 진입 시) */
  isOnSale: z.boolean().default(true),
})
export type MenuProductDetail = z.infer<typeof menuProductDetailSchema>

/** 떨이(deal) — 원가/할인가/할인율 + 픽업 마감 + 남은 개수 */
export const dealProductDetailSchema = z.object({
  ...productCommon,
  kind: z.literal('deal'),
  /** 원가(취소선) */
  originalPrice: z.number().default(0),
  /** 할인가 */
  salePrice: z.number().default(0),
  /** 할인율(%) — 원가 대비 자동 계산값 */
  discountRate: z.number().int().default(0),
  /** 픽업 마감 시각(ISO) — 실시간 카운트다운 기준 */
  pickupDeadline: z.string(),
  /** 잔여 수량 — 수량 선택 상한 */
  stockLeft: z.number().int().default(0),
  dealStatus: dealStatusSchema,
})
export type DealProductDetail = z.infer<typeof dealProductDetailSchema>

/** 상품 상세 — kind 로 분기되는 discriminated union */
export const productDetailSchema = z.discriminatedUnion('kind', [
  menuProductDetailSchema,
  dealProductDetailSchema,
])
export type ProductDetail = z.infer<typeof productDetailSchema>

/** 라우트 파라미터 — /product/:kind/:productId (kind 는 enum 검증). productId는 URL string → 페이지에서 Number() 변환 */
export const productDetailParamsSchema = z.object({
  kind: productKindSchema,
  productId: z.string().min(1),
})
export type ProductDetailParams = z.infer<typeof productDetailParamsSchema>
