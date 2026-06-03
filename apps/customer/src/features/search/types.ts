import { z } from 'zod'
import {
  DEFAULT_STORE_SORT,
  storeListItemSchema,
  storeSortSchema,
} from '@/features/store-list/types'

/**
 * 검색 (소비자) 도메인 타입 / Zod 스키마 — Phase 9: 키워드 검색 · 검색 자동완성 · 검색 기록.
 *
 * - 키워드 검색: 매장명·상품명을 FTS 로 매칭 → 매장 섹션 + 상품 섹션. 노출 범위(5km·영업중)·정렬은
 *   전체 매장 조회와 동일 → store-list 의 sort/매장 카드 스키마를 그대로 재사용한다.
 * - 자동완성: pg_trgm 유사 매장명·상품명을 제안(드롭다운). 제안 탭 → 그 텍스트로 키워드 검색.
 * - 검색은 5km 한정이라 결과 집합이 작음 → 페이지네이션 없이 전량 반환(개수 = 배열 length).
 */

/** URL 검색 파라미터 — `/search?q=&sort=`. 정렬은 전체 매장 조회와 동일 5종(기본 추천순). */
export const searchParamsSchema = z.object({
  q: z.string().trim().default('').catch(''),
  sort: storeSortSchema.default(DEFAULT_STORE_SORT).catch(DEFAULT_STORE_SORT),
})
export type SearchParams = z.infer<typeof searchParamsSchema>

/** 자동완성 제안 — 실재하는 매장명/상품명. kind 는 아이콘 구분용, 탭 시 text 로 키워드 검색 실행. */
export const searchSuggestionSchema = z.object({
  kind: z.enum(['store', 'product']),
  text: z.string(),
})
export type SearchSuggestion = z.infer<typeof searchSuggestionSchema>

/**
 * 상품 결과 행 — 상품 상세(`/product/:kind/:id`) 진입. kind 로 가격 표시 분기(product-detail 와 결).
 * deal(떨이)=원가/할인가/할인율, menu(일반)=정가.
 */
export const searchProductItemSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('deal'),
    id: z.string(),
    storeId: z.string(),
    storeName: z.string(),
    name: z.string(),
    imageUrl: z.string().nullable(),
    originalPrice: z.number(),
    salePrice: z.number(),
    discountRate: z.number(),
  }),
  z.object({
    kind: z.literal('menu'),
    id: z.string(),
    storeId: z.string(),
    storeName: z.string(),
    name: z.string(),
    imageUrl: z.string().nullable(),
    price: z.number(),
  }),
])
export type SearchProductItem = z.infer<typeof searchProductItemSchema>

/**
 * 키워드 검색 결과 — 매장 섹션 + 상품 섹션. 각 섹션은 직접 매칭만(소속 상품 매칭으로 매장이
 * 매장 섹션에 들어오지 않음). 매장은 전체 매장 조회 카드(storeListItem)를 그대로 재사용.
 */
export const searchResultSchema = z.object({
  stores: z.array(storeListItemSchema),
  products: z.array(searchProductItemSchema),
})
export type SearchResult = z.infer<typeof searchResultSchema>
