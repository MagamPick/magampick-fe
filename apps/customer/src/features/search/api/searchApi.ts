import type { StoreListItem, StoreSort } from '@/features/store-list/types'
import {
  searchResultSchema,
  searchSuggestionSchema,
  type SearchResult,
  type SearchSuggestion,
} from '../types'

/**
 * ⚠️ Mock 스텁 — 키워드 검색·자동완성 BE(BE 완료 NO)가 아직이라 가짜 응답.
 * BE 완료 후 `apiClient` 실제 호출 + Zod 응답 검증으로 교체 (api-client-convention).
 * 노출 범위(기본 주소지 5km·OPEN·오늘 영업)·거리·정렬은 BE/DB(PostgreSQL FTS + pg_trgm) 책임 →
 * mock 은 "이미 필터된" 풀을 들고, 키워드 검색(FTS=부분 일치)과 자동완성(pg_trgm=유사·오타 허용)이
 * **같은 풀**을 공유한다(명세: 제안 범위 = 키워드 검색 범위 → 제안 탭하면 결과가 반드시 나옴).
 * 매장/상품 정렬키(maxDiscountRate·nearestDeadlineMin·추천 점수)는 BE 계산값을 흉내내며,
 * 응답엔 노출 안 됨(Zod 가 strip). 단골 여부(isFavorite)는 단골 단일 소스(favoritesApi)를 읽는다.
 */
const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

const normalize = (s: string) => s.trim().toLowerCase()
const compact = (s: string) => normalize(s).replace(/\s+/g, '')

/** 자동완성 유사도 — Dice 계수(bigram). 오타·부분 입력 허용(pg_trgm trigram 흉내). */
function bigrams(s: string): string[] {
  const t = compact(s)
  const grams: string[] = []
  for (let i = 0; i < t.length - 1; i += 1) grams.push(t.slice(i, i + 2))
  return grams
}
function similarity(a: string, b: string): number {
  const A = bigrams(a)
  const B = bigrams(b)
  if (A.length === 0 || B.length === 0) return 0
  const setB = new Set(B)
  const inter = A.filter((g) => setB.has(g)).length
  return (2 * inter) / (A.length + B.length)
}

/** 자동완성 구현 상수 (명세가 비고정으로 위임 — 최소 글자수·최대 개수·유사도 임계값) */
const AUTOCOMPLETE_MIN_CHARS = 1
const AUTOCOMPLETE_MAX = 8
const SIMILARITY_THRESHOLD = 0.3

/** mock 매장 = 카드 필드 + 정렬 전용 내부 키(응답엔 노출 안 됨 — Zod strip) */
interface MockStore extends Omit<StoreListItem, 'isFavorite'> {
  maxDiscountRate: number
  nearestDeadlineMin: number
}

/** mock 상품 = 결과 행 필드(kind 분기) + 정렬 전용 내부 키 */
type MockProduct =
  | {
      kind: 'deal'
      id: string
      storeId: string
      storeName: string
      name: string
      imageUrl: string | null
      originalPrice: number
      salePrice: number
      discountRate: number
      distanceKm: number
      rating: number
      nearestDeadlineMin: number
    }
  | {
      kind: 'menu'
      id: string
      storeId: string
      storeName: string
      name: string
      imageUrl: string | null
      price: number
      distanceKm: number
      rating: number
    }

/** 거리 오름차순 정의 (안정 정렬 tie-break 자연스럽게). 베이커리/카페/디저트 테마. */
const STORES: MockStore[] = [
  { id: 'st-1', name: '베이커리 브레드샵', imageUrl: null, distanceKm: 0.3, rating: 4.6, activeDealCount: 2, maxDiscountRate: 40, nearestDeadlineMin: 35 },
  { id: 'st-2', name: '카페 모리', imageUrl: null, distanceKm: 0.5, rating: 4.4, activeDealCount: 1, maxDiscountRate: 40, nearestDeadlineMin: 50 },
  { id: 'st-3', name: '데일리 브레드', imageUrl: null, distanceKm: 0.6, rating: 4.8, activeDealCount: 3, maxDiscountRate: 45, nearestDeadlineMin: 20 },
  { id: 'st-4', name: '마카롱 공방', imageUrl: null, distanceKm: 0.9, rating: 4.7, activeDealCount: 2, maxDiscountRate: 55, nearestDeadlineMin: 12 },
  { id: 'st-5', name: '휘낭시에 하우스', imageUrl: null, distanceKm: 1.2, rating: 4.3, activeDealCount: 1, maxDiscountRate: 25, nearestDeadlineMin: 70 },
  { id: 'st-6', name: '치즈케이크 팩토리', imageUrl: null, distanceKm: 1.6, rating: 4.5, activeDealCount: 2, maxDiscountRate: 50, nearestDeadlineMin: 30 },
  { id: 'st-7', name: '베이글 브라더스', imageUrl: null, distanceKm: 2.1, rating: 4.1, activeDealCount: 1, maxDiscountRate: 35, nearestDeadlineMin: 60 },
  { id: 'st-8', name: '소금빵 연구소', imageUrl: null, distanceKm: 2.8, rating: 4.9, activeDealCount: 1, maxDiscountRate: 35, nearestDeadlineMin: 45 },
]

const PRODUCTS: MockProduct[] = [
  { kind: 'deal', id: 'p-1', storeId: 'st-1', storeName: '베이커리 브레드샵', name: '크루아상', imageUrl: null, originalPrice: 4000, salePrice: 2400, discountRate: 40, distanceKm: 0.3, rating: 4.6, nearestDeadlineMin: 35 },
  { kind: 'deal', id: 'p-2', storeId: 'st-3', storeName: '데일리 브레드', name: '초코 크루아상', imageUrl: null, originalPrice: 4500, salePrice: 2475, discountRate: 45, distanceKm: 0.6, rating: 4.8, nearestDeadlineMin: 20 },
  { kind: 'deal', id: 'p-3', storeId: 'st-4', storeName: '마카롱 공방', name: '마카롱 6구', imageUrl: null, originalPrice: 12000, salePrice: 5400, discountRate: 55, distanceKm: 0.9, rating: 4.7, nearestDeadlineMin: 12 },
  { kind: 'deal', id: 'p-4', storeId: 'st-5', storeName: '휘낭시에 하우스', name: '휘낭시에', imageUrl: null, originalPrice: 2500, salePrice: 1875, discountRate: 25, distanceKm: 1.2, rating: 4.3, nearestDeadlineMin: 70 },
  { kind: 'deal', id: 'p-5', storeId: 'st-6', storeName: '치즈케이크 팩토리', name: '치즈케이크', imageUrl: null, originalPrice: 6000, salePrice: 3000, discountRate: 50, distanceKm: 1.6, rating: 4.5, nearestDeadlineMin: 30 },
  { kind: 'deal', id: 'p-6', storeId: 'st-8', storeName: '소금빵 연구소', name: '소금빵', imageUrl: null, originalPrice: 3000, salePrice: 1950, discountRate: 35, distanceKm: 2.8, rating: 4.9, nearestDeadlineMin: 45 },
  { kind: 'deal', id: 'p-7', storeId: 'st-2', storeName: '카페 모리', name: '라떼', imageUrl: null, originalPrice: 5000, salePrice: 3000, discountRate: 40, distanceKm: 0.5, rating: 4.4, nearestDeadlineMin: 50 },
  { kind: 'menu', id: 'p-8', storeId: 'st-2', storeName: '카페 모리', name: '아메리카노', imageUrl: null, price: 4000, distanceKm: 0.5, rating: 4.4 },
  { kind: 'menu', id: 'p-9', storeId: 'st-7', storeName: '베이글 브라더스', name: '플레인 베이글', imageUrl: null, price: 3500, distanceKm: 2.1, rating: 4.1 },
  { kind: 'deal', id: 'p-10', storeId: 'st-7', storeName: '베이글 브라더스', name: '통밀 베이글', imageUrl: null, originalPrice: 4000, salePrice: 2600, discountRate: 35, distanceKm: 2.1, rating: 4.1, nearestDeadlineMin: 60 },
]

/** 추천 점수 — 전체 매장 조회와 동형(거리 가산 + 평점 + 떨이 보너스) */
const storeScore = (s: MockStore) => 5 - s.distanceKm + s.rating + (s.activeDealCount > 0 ? 1.5 : 0)
const STORE_COMPARATORS: Record<StoreSort, (a: MockStore, b: MockStore) => number> = {
  recommended: (a, b) => storeScore(b) - storeScore(a),
  distance: (a, b) => a.distanceKm - b.distanceKm,
  discount: (a, b) => b.maxDiscountRate - a.maxDiscountRate,
  closing: (a, b) => a.nearestDeadlineMin - b.nearestDeadlineMin,
  rating: (a, b) => b.rating - a.rating,
}

const prodDiscount = (p: MockProduct) => (p.kind === 'deal' ? p.discountRate : 0)
const prodDeadline = (p: MockProduct) => (p.kind === 'deal' ? p.nearestDeadlineMin : Infinity)
const prodScore = (p: MockProduct) => 5 - p.distanceKm + p.rating + (p.kind === 'deal' ? 1.5 : 0)
const PRODUCT_COMPARATORS: Record<StoreSort, (a: MockProduct, b: MockProduct) => number> = {
  recommended: (a, b) => prodScore(b) - prodScore(a),
  distance: (a, b) => a.distanceKm - b.distanceKm,
  discount: (a, b) => prodDiscount(b) - prodDiscount(a),
  closing: (a, b) => prodDeadline(a) - prodDeadline(b),
  rating: (a, b) => b.rating - a.rating,
}

// 단골 isFavorite 은 #14 검색 실연동 시 BE 응답 필드로. 전환적 false.
const toStoreItem = (s: MockStore): StoreListItem => ({
  id: s.id,
  name: s.name,
  imageUrl: s.imageUrl,
  distanceKm: s.distanceKm,
  rating: s.rating,
  activeDealCount: s.activeDealCount,
  isFavorite: false,
})

export const searchApi = {
  /**
   * 키워드 검색(FTS 흉내 = 부분 일치). 매장 섹션 = 매장명 매칭만 / 상품 섹션 = 상품명 매칭만
   * (각 섹션은 직접 매칭만 — 소속 상품 매칭으로 매장이 매장 섹션에 들어오지 않음). 두 섹션 같은 정렬.
   */
  async search({ q, sort }: { q: string; sort: StoreSort }): Promise<SearchResult> {
    await delay(250)
    const qn = normalize(q)
    if (!qn) return searchResultSchema.parse({ stores: [], products: [] })
    const stores = STORES.filter((s) => normalize(s.name).includes(qn)).sort(STORE_COMPARATORS[sort])
    const products = PRODUCTS.filter((p) => normalize(p.name).includes(qn)).sort(
      PRODUCT_COMPARATORS[sort],
    )
    return searchResultSchema.parse({ stores: stores.map(toStoreItem), products })
  },

  /**
   * 자동완성(pg_trgm 흉내) — 실재하는 매장명·상품명을 유사도순 제안(부분·오타 허용).
   * startsWith > includes > Dice 유사도. 최대 8개, 동일 텍스트 중복 제거. 매칭 0 → 빈 배열.
   */
  async autocomplete({ q }: { q: string }): Promise<SearchSuggestion[]> {
    await delay(120)
    const qn = normalize(q)
    if (qn.length < AUTOCOMPLETE_MIN_CHARS) return []

    const candidates: SearchSuggestion[] = [
      ...STORES.map((s) => ({ kind: 'store' as const, text: s.name })),
      ...PRODUCTS.map((p) => ({ kind: 'product' as const, text: p.name })),
    ]

    const scored = candidates
      .map((c) => {
        const n = normalize(c.text)
        let score: number
        if (n.startsWith(qn)) score = 1
        else if (n.includes(qn)) score = 0.8
        else score = similarity(c.text, q)
        return { c, score }
      })
      .filter((x) => x.score >= SIMILARITY_THRESHOLD)
      .sort((a, b) => b.score - a.score || a.c.text.localeCompare(b.c.text))

    const seen = new Set<string>()
    const result: SearchSuggestion[] = []
    for (const { c } of scored) {
      if (seen.has(c.text)) continue
      seen.add(c.text)
      result.push(searchSuggestionSchema.parse(c))
      if (result.length >= AUTOCOMPLETE_MAX) break
    }
    return result
  },
}
