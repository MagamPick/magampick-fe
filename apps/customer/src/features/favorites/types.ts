import { z } from 'zod'

/**
 * 단골매장 도메인 타입 / Zod 스키마 (노션 "단골매장 추가/해제" · "단골매장 목록 조회").
 *
 * - 단골 단위 = 매장만 (상품·떨이 단골 X). 단순 추가/해제 토글, idempotent.
 * - 거리·별점·정렬·통계는 BE 책임.
 * - BE FavoriteStoreResponse 전 필드 optional(OpenAPI 생성기 특성) → Zod 에서 누락 방어.
 */

/** 도메인 에러 코드 (노션 AC) — BE 409 ApiError.code 매핑용 */
export const FAVORITE_ERROR = {
  LIMIT_REACHED: 'FAVORITE_LIMIT_REACHED',
} as const

/** 단골매장 카드 — 매장 단위 (대표 사진·매장명·거리·별점 평균·진행 중 마감할인 개수) */
export const favoriteStoreSchema = z.object({
  /** BE FavoriteStoreResponse.id (int64) — number */
  id: z.number(),
  name: z.string().default(''),
  /**
   * BE optional·non-null (imageUrl 필드 absent 가능, null 아님).
   * nullish().transform 으로 absent→null 변환해 FE 타입을 string | null 로 유지.
   */
  imageUrl: z
    .string()
    .nullish()
    .transform((v) => v ?? null),
  /** 직선거리(km) — BE 계산 */
  distanceKm: z.number().default(0),
  /** 리뷰 별점 평균 (매장 단위, Phase 6 리뷰) */
  rating: z.number().default(0),
  /** 진행 중(ACTIVE) 마감 할인 개수 — 0이면 카드 배지 생략 */
  activeDealCount: z.number().default(0),
})
export type FavoriteStore = z.infer<typeof favoriteStoreSchema>

/** 단골매장 목록 응답 — 카드 배열 + 상단 통계 */
export const favoriteListSchema = z.object({
  /** 떨이 활성 매장 우선 → 등록순(단골 추가 시각 asc). BE 정렬 결과. */
  stores: z.array(favoriteStoreSchema).default([]),
  /** 총 단골 매장 개수 */
  totalCount: z.number().default(0),
  /** 오늘 진행 중 마감할인 합계 (전체 단골 매장의 활성 떨이 합산) */
  totalActiveDealCount: z.number().default(0),
})
export type FavoriteList = z.infer<typeof favoriteListSchema>
