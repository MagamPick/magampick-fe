import { favoritesApi } from '@/features/favorites/api/favoritesApi'
import {
  storeListPageSchema,
  type StoreListItem,
  type StoreListPage,
  type StoreSort,
} from '../types'

/**
 * ⚠️ Mock 스텁 — 전체 매장 조회 BE(BE 완료 NO)가 아직이라 가짜 응답.
 * BE 완료 후 `apiClient` 실제 호출 + Zod 응답 검증으로 교체 (api-client-convention).
 * 반경 5km·운영상태(OPEN+영업요일)·거리·정렬은 BE/DB(ADR-003 PostGIS) 책임 —
 * mock 도 "이미 필터·정렬된" 결과를 반환한다(FE 는 거리/정렬 계산 X). 정렬 키(maxDiscountRate·
 * nearestDeadlineMin·추천 점수)는 BE 가 떨이/리뷰에서 계산하는 값을 mock 이 흉내낸다.
 * 단골 여부(isFavorite)는 BE 가 단골 단일 소스를 join 하듯, mock 은 `favoritesApi` 를 읽는다.
 */
const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))
const UNSPLASH = (id: string) =>
  `https://images.unsplash.com/${id}?w=320&h=320&fit=crop&q=80&auto=format`

/** mock 매장 = 카드 필드 + 정렬 전용 내부 키(응답엔 노출 안 됨 — Zod 가 strip) */
interface MockStore extends Omit<StoreListItem, 'isFavorite'> {
  /** 활성 떨이 중 최대 할인율(%) — 할인율순. 떨이 0개면 0 */
  maxDiscountRate: number
  /** 활성 떨이 중 가장 임박한 픽업 마감까지의 분 — 마감임박순. 떨이 0개면 Infinity */
  nearestDeadlineMin: number
}

/** 거리 오름차순으로 정의 (안정 정렬의 tie-break 가 자연스럽도록) */
const STORES: MockStore[] = [
  {
    id: 'st-1',
    name: '베이커리 브레드샵',
    imageUrl: UNSPLASH('photo-1555507036-ab1f4038808a'),
    distanceKm: 0.3,
    rating: 4.6,
    activeDealCount: 2,
    maxDiscountRate: 40,
    nearestDeadlineMin: 35,
  },
  {
    id: 'sl-1',
    name: '데일리 브레드',
    imageUrl: null,
    distanceKm: 0.5,
    rating: 4.4,
    activeDealCount: 3,
    maxDiscountRate: 45,
    nearestDeadlineMin: 20,
  },
  {
    id: 'nb-1',
    name: '북카페 무드',
    imageUrl: UNSPLASH('photo-1481833761820-0509d3217039'),
    distanceKm: 0.6,
    rating: 4.8,
    activeDealCount: 1,
    maxDiscountRate: 30,
    nearestDeadlineMin: 50,
  },
  {
    id: 'nb-3',
    name: '브레드앤버터',
    imageUrl: UNSPLASH('photo-1509440159596-0249088772ff'),
    distanceKm: 0.9,
    rating: 4.7,
    activeDealCount: 4,
    maxDiscountRate: 55,
    nearestDeadlineMin: 12,
  },
  {
    id: 'sl-2',
    name: '수제버거 그릴',
    imageUrl: null,
    distanceKm: 1.1,
    rating: 4.5,
    activeDealCount: 1,
    maxDiscountRate: 25,
    nearestDeadlineMin: 70,
  },
  {
    id: 'sl-3',
    name: '베이글 공방',
    imageUrl: null,
    distanceKm: 1.3,
    rating: 4.3,
    activeDealCount: 0,
    maxDiscountRate: 0,
    nearestDeadlineMin: Infinity,
  },
  {
    id: 'sl-4',
    name: '국수나무 서교',
    imageUrl: null,
    distanceKm: 1.5,
    rating: 4.2,
    activeDealCount: 2,
    maxDiscountRate: 35,
    nearestDeadlineMin: 45,
  },
  {
    id: 'sl-5',
    name: '오븐 베이커리',
    imageUrl: null,
    distanceKm: 1.8,
    rating: 4.1,
    activeDealCount: 1,
    maxDiscountRate: 20,
    nearestDeadlineMin: 88,
  },
  {
    id: 'sl-6',
    name: '마라탕 후오궈',
    imageUrl: null,
    distanceKm: 2.0,
    rating: 3.9,
    activeDealCount: 3,
    maxDiscountRate: 50,
    nearestDeadlineMin: 30,
  },
  {
    id: 'sl-7',
    name: '샐러드볼 서교',
    imageUrl: null,
    distanceKm: 2.4,
    rating: 4.9,
    activeDealCount: 1,
    maxDiscountRate: 28,
    nearestDeadlineMin: 60,
  },
  {
    id: 'sl-8',
    name: '카페 모리',
    imageUrl: null,
    distanceKm: 2.9,
    rating: 4.0,
    activeDealCount: 0,
    maxDiscountRate: 0,
    nearestDeadlineMin: Infinity,
  },
  {
    id: 'sl-9',
    name: '새벽 두부집',
    imageUrl: null,
    distanceKm: 3.2,
    rating: 0,
    activeDealCount: 0,
    maxDiscountRate: 0,
    nearestDeadlineMin: Infinity,
  },
]

const PAGE_SIZE = 6

/** 추천 점수 = 거리(가까울수록 가산) + 리뷰 평점 + 떨이 활성 보너스. 가중치는 구현 상수(홈 동네 마감픽과 동일 로직). */
const DISTANCE_WEIGHT = 1
const RATING_WEIGHT = 1
const ACTIVE_DEAL_BONUS = 1.5
const recommendScore = (s: MockStore) =>
  (5 - s.distanceKm) * DISTANCE_WEIGHT +
  s.rating * RATING_WEIGHT +
  (s.activeDealCount > 0 ? ACTIVE_DEAL_BONUS : 0)

/** 정렬 비교자 — BE 정렬 흉내. 떨이 0개 매장은 할인율(0)·마감임박(∞)으로 자연히 뒤로 밀린다. */
const COMPARATORS: Record<StoreSort, (a: MockStore, b: MockStore) => number> = {
  recommended: (a, b) => recommendScore(b) - recommendScore(a),
  distance: (a, b) => a.distanceKm - b.distanceKm,
  discount: (a, b) => b.maxDiscountRate - a.maxDiscountRate,
  closing: (a, b) => a.nearestDeadlineMin - b.nearestDeadlineMin,
  rating: (a, b) => b.rating - a.rating,
}

const toItem = (s: MockStore): StoreListItem => ({
  id: s.id,
  name: s.name,
  imageUrl: s.imageUrl,
  distanceKm: s.distanceKm,
  rating: s.rating,
  activeDealCount: s.activeDealCount,
  isFavorite: favoritesApi.isFavorite(s.id),
})

export const storeListApi = {
  /** 5km 이내 매장 전체를 정렬 1종으로 (cursor 페이징). 끝 페이지면 nextCursor=null. */
  async getStores({
    sort,
    cursor = 0,
  }: {
    sort: StoreSort
    cursor?: number
  }): Promise<StoreListPage> {
    await delay(350)
    const sorted = [...STORES].sort(COMPARATORS[sort])
    const start = cursor * PAGE_SIZE
    const items = sorted.slice(start, start + PAGE_SIZE).map(toItem)
    const nextCursor = start + PAGE_SIZE < sorted.length ? cursor + 1 : null
    return storeListPageSchema.parse({
      items,
      nextCursor,
      total: STORES.length,
      dealStoreCount: STORES.filter((s) => s.activeDealCount > 0).length,
    })
  },
}
