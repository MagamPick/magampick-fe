import { z } from 'zod'

/**
 * 단골매장 도메인 타입 / Zod 스키마 (노션 "단골매장 추가/해제" · "단골매장 목록 조회").
 *
 * - 단골 단위 = 매장만 (상품·떨이 단골 X). 단순 추가/해제 토글, idempotent.
 * - 거리·별점·정렬·통계는 BE 책임 → mock 은 "이미 계산·정렬된" 응답을 반환한다.
 */

/** 1인당 단골매장 상한 (노션: 최대 50개) */
export const FAVORITE_LIMIT = 50

/** 도메인 에러 코드 (노션 AC) — mock API 가 ApiError.code 로 사용 */
export const FAVORITE_ERROR = {
  LIMIT_REACHED: 'FAVORITE_LIMIT_REACHED',
} as const

/** 단골매장 카드 — 매장 단위 (대표 사진·매장명·거리·별점 평균·진행 중 마감할인 개수) */
export const favoriteStoreSchema = z.object({
  id: z.string(),
  name: z.string(),
  imageUrl: z.string().nullable(),
  /** 직선거리(km) — BE 계산 */
  distanceKm: z.number(),
  /** 리뷰 별점 평균 (매장 단위, Phase 6 리뷰) */
  rating: z.number(),
  /** 진행 중(ACTIVE) 마감 할인 개수 — 0이면 카드 배지 생략 */
  activeDealCount: z.number(),
})
export type FavoriteStore = z.infer<typeof favoriteStoreSchema>

/** 단골매장 목록 응답 — 카드 배열 + 상단 통계 */
export const favoriteListSchema = z.object({
  /** 떨이 활성 매장 우선 → 등록순(단골 추가 시각 asc). BE 정렬 결과. */
  stores: z.array(favoriteStoreSchema),
  /** 총 단골 매장 개수 */
  totalCount: z.number(),
  /** 오늘 진행 중 마감할인 합계 (전체 단골 매장의 활성 떨이 합산) */
  totalActiveDealCount: z.number(),
})
export type FavoriteList = z.infer<typeof favoriteListSchema>
