import { z } from 'zod'

/**
 * 전체 매장 조회 도메인 타입 / Zod 스키마 (노션 "전체 매장 조회 (소비자)").
 *
 * - 소비자 기본 주소지 기준 직선거리 5km 이내 매장 전체를 정렬 5종 중 하나로 노출. 필터 없음.
 * - 반경·운영상태(OPEN+영업요일)·거리·정렬은 BE/DB(ADR-003 PostGIS) 책임 →
 *   FE 는 "이미 필터·정렬된" 응답을 렌더만 한다(거리/정렬 계산 X).
 * - 단골 여부(isFavorite)는 단골 단일 소스(favorites)를 BE 가 join 해 내려준다.
 */

/** 정렬 옵션 5종 (노션 정책) — 추천 점수순(default)·거리순·할인율순·마감 임박순·별점순 */
export const STORE_SORT = {
  RECOMMENDED: 'recommended',
  DISTANCE: 'distance',
  DISCOUNT: 'discount',
  CLOSING: 'closing',
  RATING: 'rating',
} as const

export const storeSortSchema = z.enum([
  STORE_SORT.RECOMMENDED,
  STORE_SORT.DISTANCE,
  STORE_SORT.DISCOUNT,
  STORE_SORT.CLOSING,
  STORE_SORT.RATING,
])
export type StoreSort = z.infer<typeof storeSortSchema>

/** ?sort 없거나 잘못된 값이면 추천순 */
export const DEFAULT_STORE_SORT: StoreSort = STORE_SORT.RECOMMENDED

/** 정렬 칩 노출 순서·라벨 (노션 고정 순서) */
export const STORE_SORT_OPTIONS: { value: StoreSort; label: string }[] = [
  { value: STORE_SORT.RECOMMENDED, label: '추천순' },
  { value: STORE_SORT.DISTANCE, label: '거리순' },
  { value: STORE_SORT.DISCOUNT, label: '할인율순' },
  { value: STORE_SORT.CLOSING, label: '마감임박순' },
  { value: STORE_SORT.RATING, label: '별점순' },
]

/** URL 검색 파라미터 — `/all?sort=`. 없거나 잘못되면 추천순으로 fallback (state-convention §9) */
export const storeListParamsSchema = z.object({
  sort: storeSortSchema.default(DEFAULT_STORE_SORT).catch(DEFAULT_STORE_SORT),
})
export type StoreListParams = z.infer<typeof storeListParamsSchema>

/** 매장 카드 — 매장 단위 (이름·거리·평점·진행 중 마감 할인 개수·단골 여부) */
export const storeListItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  imageUrl: z.string().nullable(),
  /** 직선거리(km) — BE 계산 */
  distanceKm: z.number(),
  /** 리뷰 평균 평점 (0 = 리뷰 없음) */
  rating: z.number(),
  /** 진행 중(ACTIVE) 마감 할인 개수 — 0이면 카드 배지 생략 */
  activeDealCount: z.number(),
  /** 소비자가 단골 등록한 매장이면 true → 단골 뱃지 노출 */
  isFavorite: z.boolean(),
})
export type StoreListItem = z.infer<typeof storeListItemSchema>

/** 무한 스크롤 페이지 — cursor 페이징 + 상단 요약 집계 */
export const storeListPageSchema = z.object({
  items: z.array(storeListItemSchema),
  /** 다음 페이지 커서 — null 이면 마지막 페이지 */
  nextCursor: z.number().nullable(),
  /** 5km 이내 노출 매장 총 수 ("전체 N곳") */
  total: z.number(),
  /** 그 중 진행 중 마감 할인 보유 매장 수 ("마감 할인 진행 M곳") */
  dealStoreCount: z.number(),
})
export type StoreListPage = z.infer<typeof storeListPageSchema>
