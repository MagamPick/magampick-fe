import { z } from 'zod'
import {
  closingDealSchema,
  favoriteStoreSchema,
  neighborhoodStoreSchema,
  type ClosingDeal,
  type FavoriteStore,
  type NeighborhoodStore,
} from '../types'

/**
 * ⚠️ Mock 스텁 — 백엔드 홈 피드 API(BE 완료 NO)가 아직이라 가짜 응답.
 * BE 완료 후 `apiClient` 실제 호출 + Zod 응답 검증으로 교체 (api-client-convention).
 * 반경 5km·운영상태(OPEN+영업요일)·룰 스코어링 필터/정렬은 BE/DB(ADR-003 PostGIS) 책임 —
 * mock도 "이미 필터·정렬된" 배열을 반환한다 (FE는 거리/정렬 계산 안 함).
 */
const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

/** 픽업 마감 시각을 "지금 + m분" 으로 생성 (카운트다운이 항상 라이브하도록) */
const minutesFromNow = (m: number) => new Date(Date.now() + m * 60_000).toISOString()

const UNSPLASH = (id: string) =>
  `https://images.unsplash.com/${id}?w=320&h=320&fit=crop&q=80&auto=format`

/** ① 마감 임박 특가 — 마감 가까운 순 (BE 정렬 결과 가정). 상위 5개 노출. */
const CLOSING_DEALS: ClosingDeal[] = [
  {
    id: 'cd-1',
    storeName: '데일리 브레드',
    productName: '호밀 식빵 1봉',
    imageUrl: null,
    discountRate: 40,
    originalPrice: 7500,
    salePrice: 4500,
    pickupDeadline: minutesFromNow(8),
  },
  {
    id: 'cd-2',
    storeName: '베이커리 브레드샵',
    productName: '크루아상 세트',
    imageUrl: UNSPLASH('photo-1555507036-ab1f4038808a'),
    discountRate: 50,
    originalPrice: 9000,
    salePrice: 4500,
    pickupDeadline: minutesFromNow(13),
  },
  {
    id: 'cd-3',
    storeName: '커피로스터스 합정',
    productName: '시그니처 라떼 2잔',
    imageUrl: UNSPLASH('photo-1495474472287-4d71bcdd2085'),
    discountRate: 50,
    originalPrice: 7800,
    salePrice: 3900,
    pickupDeadline: minutesFromNow(27),
  },
  {
    id: 'cd-4',
    storeName: '스윗아워 디저트',
    productName: '3단 마카롱 세트',
    imageUrl: null,
    discountRate: 44,
    originalPrice: 9800,
    salePrice: 5500,
    pickupDeadline: minutesFromNow(41),
  },
  {
    id: 'cd-5',
    storeName: '샐러드볼 서교',
    productName: '닭가슴살 샐러드',
    imageUrl: null,
    discountRate: 35,
    originalPrice: 8000,
    salePrice: 5200,
    pickupDeadline: minutesFromNow(56),
  },
]

/** ② 단골 가게 — 활성 떨이 보유 매장 우선, 동률 거리순 (BE 정렬 결과 가정). 상위 4개 노출. */
const FAVORITE_STORES: FavoriteStore[] = [
  { id: 'fv-1', name: '데일리 브레드', imageUrl: null, distanceKm: 0.2, activeDealCount: 2 },
  { id: 'fv-2', name: '베이커리 브레드샵', imageUrl: null, distanceKm: 0.3, activeDealCount: 3 },
  { id: 'fv-3', name: '커피로스터스 합정', imageUrl: null, distanceKm: 0.4, activeDealCount: 2 },
  { id: 'fv-4', name: '스윗아워 디저트', imageUrl: null, distanceKm: 0.5, activeDealCount: 1 },
  { id: 'fv-5', name: '동네분식 서교점', imageUrl: null, distanceKm: 0.7, activeDealCount: 0 },
  { id: 'fv-6', name: '한솥도시락 합정', imageUrl: null, distanceKm: 1.2, activeDealCount: 0 },
]

/** ③ 우리 동네 마감픽 — 룰 스코어링 정렬 결과 가정. 홈은 고정 상위 6개 프리뷰(무한 스크롤 X). */
const NEIGHBORHOOD: NeighborhoodStore[] = [
  { id: 'nb-1', name: '북카페 무드', imageUrl: null, distanceKm: 0.6, rating: 4.8, activeDealCount: 2 },
  { id: 'nb-2', name: '카페 모리', imageUrl: null, distanceKm: 0.6, rating: 4.8, activeDealCount: 1 },
  { id: 'nb-3', name: '브레드앤버터', imageUrl: null, distanceKm: 0.9, rating: 4.7, activeDealCount: 4 },
  { id: 'nb-4', name: '수제버거 그릴', imageUrl: null, distanceKm: 1.1, rating: 4.5, activeDealCount: 1 },
  { id: 'nb-5', name: '베이글 공방', imageUrl: null, distanceKm: 1.3, rating: 4.4, activeDealCount: 0 },
  { id: 'nb-6', name: '국수나무 서교', imageUrl: null, distanceKm: 1.5, rating: 4.3, activeDealCount: 2 },
  { id: 'nb-7', name: '오븐 베이커리', imageUrl: null, distanceKm: 1.8, rating: 4.2, activeDealCount: 1 },
  { id: 'nb-8', name: '마라탕 후오궈', imageUrl: null, distanceKm: 2.0, rating: 4.1, activeDealCount: 3 },
]

const NEIGHBORHOOD_LIMIT = 6

export const homeApi = {
  /** 헤더에 표시할 기본 주소지 라벨 (실제로는 주소지/customer 도메인에서 옴) */
  async getHomeAddress(): Promise<{ label: string }> {
    await delay(150)
    return { label: '서울 마포구 서교동' }
  },

  async getClosingDeals(): Promise<ClosingDeal[]> {
    await delay(400)
    return z.array(closingDealSchema).parse(CLOSING_DEALS.slice(0, 5))
  },

  async getFavoriteStores(): Promise<FavoriteStore[]> {
    await delay(400)
    return z.array(favoriteStoreSchema).parse(FAVORITE_STORES.slice(0, 4))
  },

  async getNeighborhoodStores(): Promise<NeighborhoodStore[]> {
    await delay(500)
    return z.array(neighborhoodStoreSchema).parse(NEIGHBORHOOD.slice(0, NEIGHBORHOOD_LIMIT))
  },
}
