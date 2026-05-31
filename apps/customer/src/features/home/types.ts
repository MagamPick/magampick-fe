import { z } from 'zod'

/**
 * 홈 피드 도메인 타입 (노션: 홈 피드 — 주변 매장/떨이).
 * 반경 5km·운영상태·정렬은 BE/DB 책임(ADR-003 PostGIS) — FE는 섹션별 응답을 렌더만 한다.
 */

/** ① 마감 임박 특가 — 떨이 상품 단위 카드 */
export const closingDealSchema = z.object({
  id: z.string(),
  storeName: z.string(),
  productName: z.string(),
  imageUrl: z.string().nullable(),
  /** 할인율(%) */
  discountRate: z.number(),
  /** 원가(취소선) */
  originalPrice: z.number(),
  /** 할인가 */
  salePrice: z.number(),
  /** 픽업 마감 시각(ISO) — 실시간 카운트다운 기준. 노출 대상은 60분 이내(BE 필터). */
  pickupDeadline: z.string(),
})
export type ClosingDeal = z.infer<typeof closingDealSchema>

/** ② 단골 가게 — 매장 단위 카드 */
export const favoriteStoreSchema = z.object({
  id: z.string(),
  name: z.string(),
  imageUrl: z.string().nullable(),
  /** 직선거리(km) */
  distanceKm: z.number(),
  /** 진행 중 마감 할인 개수 (0이면 카드에 배지 생략) */
  activeDealCount: z.number(),
})
export type FavoriteStore = z.infer<typeof favoriteStoreSchema>

/** ③ 우리 동네 마감픽 — 매장 단위 카드(+평점). 홈은 고정 상위 N 프리뷰. */
export const neighborhoodStoreSchema = z.object({
  id: z.string(),
  name: z.string(),
  imageUrl: z.string().nullable(),
  distanceKm: z.number(),
  /** 리뷰 평점 */
  rating: z.number(),
  activeDealCount: z.number(),
})
export type NeighborhoodStore = z.infer<typeof neighborhoodStoreSchema>
