import { z } from 'zod'

/**
 * 홈 피드 도메인 타입 (노션: 홈 피드 — 주변 매장/떨이).
 * 반경 5km·운영상태·정렬은 BE/DB 책임(ADR-003 PostGIS) — FE는 섹션별 응답을 렌더만 한다.
 */

/** ① 마감 임박 특가 — 떨이 상품 단위 카드 */
export const closingDealSchema = z.object({
  /** BE int64 → number */
  id: z.number(),
  storeName: z.string().default(''),
  productName: z.string().default(''),
  /**
   * BE optional·null 가능 — nullish().transform 으로 absent/null → null 변환.
   */
  imageUrl: z
    .string()
    .nullish()
    .transform((v) => v ?? null),
  /** 할인율(%) */
  discountRate: z.number().default(0),
  /** 원가(취소선) */
  originalPrice: z.number().default(0),
  /** 할인가 */
  salePrice: z.number().default(0),
  /** 픽업 마감 시각(ISO) — 실시간 카운트다운 기준. 노출 대상은 60분 이내(BE 필터). */
  pickupDeadline: z.string(),
})
export type ClosingDeal = z.infer<typeof closingDealSchema>

// ② 단골 가게 — 매장 단위 카드. 타입은 favorites 도메인 canonical(id: number) 을 재사용한다(@/features/favorites/types).

/** ③ 우리 동네 마감픽 — 매장 단위 카드(+평점). 홈은 고정 상위 N 프리뷰. */
export const neighborhoodStoreSchema = z.object({
  /** BE int64 → number */
  id: z.number(),
  name: z.string().default(''),
  /**
   * BE optional·null 가능 — nullish().transform 으로 absent/null → null 변환.
   */
  imageUrl: z
    .string()
    .nullish()
    .transform((v) => v ?? null),
  distanceKm: z.number().default(0),
  /** 리뷰 평점 */
  rating: z.number().default(0),
  activeDealCount: z.number().default(0),
})
export type NeighborhoodStore = z.infer<typeof neighborhoodStoreSchema>
