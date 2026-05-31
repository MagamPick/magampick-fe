import { z } from 'zod'
import {
  storeDetailSchema,
  storeDealSchema,
  storeMenuItemSchema,
  reviewSummarySchema,
  storeReviewPageSchema,
  type OperatingHour,
  type StoreDetail,
  type StoreDeal,
  type StoreMenuItem,
  type StoreReview,
  type ReviewSummary,
} from '../types'
import { favoritesApi } from '@/features/favorites/api/favoritesApi'

/**
 * ⚠️ Mock 스텁 — 매장 상세 BE(BE 완료 NO)가 아직이라 가짜 응답.
 * BE 완료 후 `apiClient` 실제 호출 + Zod 응답 검증으로 교체 (api-client-convention).
 * 영업상태·거리·정렬·반경은 BE/DB(ADR-003 PostGIS) 책임 — mock 은 "이미 계산된" 응답을 반환.
 */
const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

/** 픽업 마감을 "지금 + m분" 으로 — 카운트다운이 항상 라이브하도록 */
const minutesFromNow = (m: number) => new Date(Date.now() + m * 60_000).toISOString()
const daysAgo = (d: number) => new Date(Date.now() - d * 86_400_000).toISOString()
const UNSPLASH = (id: string) =>
  `https://images.unsplash.com/${id}?w=320&h=320&fit=crop&q=80&auto=format`

/** 표준 영업시간 (월~토 08:00–21:00, 일 휴무) */
const WEEK_HOURS: OperatingHour[] = [
  { day: '월', open: '08:00', close: '21:00', closed: false },
  { day: '화', open: '08:00', close: '21:00', closed: false },
  { day: '수', open: '08:00', close: '21:00', closed: false },
  { day: '목', open: '08:00', close: '21:00', closed: false },
  { day: '금', open: '08:00', close: '21:00', closed: false },
  { day: '토', open: '09:00', close: '21:00', closed: false },
  { day: '일', open: null, close: null, closed: true },
]

const STORES: Record<string, StoreDetail> = {
  'st-1': {
    id: 'st-1',
    name: '베이커리 브레드샵',
    imageUrl: UNSPLASH('photo-1555507036-ab1f4038808a'),
    businessStatus: 'OPEN',
    closingTime: '21:00',
    rating: 4.8,
    reviewCount: 412,
    distanceKm: 0.3,
    isFavorite: false,
    address: '서울 마포구 서교동 123-45',
    phone: '02-1234-5678',
    businessNumber: '123-45-67890',
    operatingHours: WEEK_HOURS,
    lat: 37.5512,
    lng: 126.9201,
  },
  'st-break': {
    id: 'st-break',
    name: '커피로스터스 합정',
    imageUrl: UNSPLASH('photo-1495474472287-4d71bcdd2085'),
    businessStatus: 'BREAK',
    closingTime: '22:00',
    rating: 4.6,
    reviewCount: 188,
    distanceKm: 0.5,
    isFavorite: true,
    address: '서울 마포구 합정동 411-1',
    phone: '02-333-7788',
    businessNumber: '211-09-55432',
    operatingHours: WEEK_HOURS,
    lat: 37.5495,
    lng: 126.9138,
  },
  'st-closed': {
    id: 'st-closed',
    name: '스윗아워 디저트',
    imageUrl: null,
    businessStatus: 'CLOSED_TODAY',
    closingTime: '20:00',
    rating: 4.4,
    reviewCount: 92,
    distanceKm: 0.8,
    isFavorite: false,
    address: '서울 마포구 망원동 57-3',
    phone: '02-777-1020',
    businessNumber: '305-22-11223',
    operatingHours: WEEK_HOURS,
    lat: 37.5562,
    lng: 126.9056,
  },
  'st-empty': {
    id: 'st-empty',
    name: '새로 문 연 동네빵집',
    imageUrl: null,
    businessStatus: 'OPEN',
    closingTime: '22:00',
    rating: 0,
    reviewCount: 0,
    distanceKm: 0.4,
    isFavorite: false,
    address: '서울 마포구 연남동 240-12',
    phone: '02-555-0000',
    businessNumber: '777-88-99000',
    operatingHours: WEEK_HOURS,
    lat: 37.5631,
    lng: 126.9251,
  },
}

const DEFAULT_NAMES = [
  '데일리 브레드',
  '북카페 무드',
  '브레드앤버터',
  '오븐 베이커리',
  '카페 모리',
  '베이글 공방',
]

/** 알 수 없는 id(홈 카드 등에서 진입)도 항상 매장을 반환 — id 기준 결정적 시드 */
function defaultStore(id: string): StoreDetail {
  const hash = [...id].reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  return {
    id,
    name: DEFAULT_NAMES[hash % DEFAULT_NAMES.length],
    imageUrl: null,
    businessStatus: 'OPEN',
    closingTime: '21:00',
    rating: 4.5,
    reviewCount: 128,
    distanceKm: 0.6,
    isFavorite: false,
    address: '서울 마포구 서교동 200-1',
    phone: '02-000-1234',
    businessNumber: '123-00-00000',
    operatingHours: WEEK_HOURS,
    lat: 37.5547 + (hash % 10) * 0.0008,
    lng: 126.921 - (hash % 7) * 0.0009,
  }
}

const DEALS: StoreDeal[] = [
  {
    id: 'sd-1',
    name: '크루아상 세트 (4개입)',
    imageUrl: UNSPLASH('photo-1555507036-ab1f4038808a'),
    discountRate: 50,
    originalPrice: 9000,
    salePrice: 4500,
    pickupDeadline: minutesFromNow(35),
    stockLeft: 5,
  },
  {
    id: 'sd-2',
    name: '호밀 식빵 1봉',
    imageUrl: null,
    discountRate: 40,
    originalPrice: 7500,
    salePrice: 4500,
    pickupDeadline: minutesFromNow(52),
    stockLeft: 3,
  },
  {
    id: 'sd-3',
    name: '오늘의 샌드위치',
    imageUrl: UNSPLASH('photo-1509440159596-0249088772ff'),
    discountRate: 35,
    originalPrice: 6000,
    salePrice: 3900,
    pickupDeadline: minutesFromNow(78),
    stockLeft: 8,
  },
]

const MENU: StoreMenuItem[] = [
  { id: 'mn-1', name: '플레인 크루아상', imageUrl: null, price: 3500, category: '베이커리' },
  { id: 'mn-2', name: '소금빵', imageUrl: null, price: 3000, category: '베이커리' },
  { id: 'mn-3', name: '통밀 캄파뉴', imageUrl: null, price: 8000, category: '베이커리' },
  { id: 'mn-4', name: '아메리카노', imageUrl: null, price: 4000, category: '음료' },
  { id: 'mn-5', name: '카페 라떼', imageUrl: null, price: 4500, category: '음료' },
  { id: 'mn-6', name: '바스크 치즈케이크', imageUrl: null, price: 6500, category: '디저트' },
  { id: 'mn-7', name: '마들렌 3종', imageUrl: null, price: 5000, category: '디저트' },
]

const REVIEW_TAGS = ['#신선해요', '#친절해요', '#재방문', '#양 많아요', '#가성비 좋아요']

const REVIEWS: StoreReview[] = Array.from({ length: 12 }, (_, i) => {
  const rating = [5, 5, 5, 4, 5, 4, 5, 3, 5, 4, 5, 2][i]
  return {
    id: `rv-${i + 1}`,
    authorNickname: `빵순이${i + 1}님`,
    rating,
    content: [
      '마감 시간에 이렇게 저렴하게 사다니! 빵도 신선하고 좋았어요.',
      '양도 많고 가성비 좋아요. 픽업도 금방 됐어요.',
      '사장님이 친절하시고 빵 종류가 다양해서 또 갈 것 같아요.',
      '가까워서 자주 이용하는데 늘 만족스럽습니다.',
    ][i % 4],
    createdAt: daysAgo(i + 1),
    photos:
      i % 3 === 0
        ? [UNSPLASH('photo-1555507036-ab1f4038808a'), UNSPLASH('photo-1509440159596-0249088772ff')]
        : i % 3 === 1
          ? [UNSPLASH('photo-1568827999250-3f6afff96e66')]
          : [],
    tags: REVIEW_TAGS.slice(0, (i % 3) + 1),
    ownerReply: i % 4 === 0 ? '맛있게 드셔주셔서 감사해요. 또 들러주세요!' : null,
  }
})

const REVIEW_SUMMARY: ReviewSummary = {
  average: 4.8,
  count: 412,
  distribution: [
    { star: 5, count: 338 },
    { star: 4, count: 49 },
    { star: 3, count: 16 },
    { star: 2, count: 5 },
    { star: 1, count: 4 },
  ],
}

const EMPTY_SUMMARY: ReviewSummary = {
  average: 0,
  count: 0,
  distribution: [5, 4, 3, 2, 1].map((star) => ({ star, count: 0 })),
}

const REVIEW_PAGE_SIZE = 5

export const storeDetailApi = {
  async getStoreDetail(id: string): Promise<StoreDetail> {
    await delay(350)
    // 단골 여부는 단일 소스(favorites)에서 — 매장 상세·홈·단골 목록이 일관 반영
    return storeDetailSchema.parse({
      ...(STORES[id] ?? defaultStore(id)),
      isFavorite: favoritesApi.isFavorite(id),
    })
  },

  async getStoreDeals(id: string): Promise<StoreDeal[]> {
    await delay(300)
    if (id === 'st-empty') return []
    return z.array(storeDealSchema).parse(DEALS)
  },

  async getStoreMenu(id: string): Promise<StoreMenuItem[]> {
    await delay(300)
    if (id === 'st-empty') return []
    return z.array(storeMenuItemSchema).parse(MENU)
  },

  async getReviewSummary(id: string): Promise<ReviewSummary> {
    await delay(250)
    return reviewSummarySchema.parse(id === 'st-empty' ? EMPTY_SUMMARY : REVIEW_SUMMARY)
  },

  async getStoreReviews(id: string, { cursor = 0 }: { cursor?: number } = {}) {
    await delay(300)
    if (id === 'st-empty') return storeReviewPageSchema.parse({ items: [], nextCursor: null })
    const start = cursor * REVIEW_PAGE_SIZE
    const items = REVIEWS.slice(start, start + REVIEW_PAGE_SIZE)
    const nextCursor = start + REVIEW_PAGE_SIZE < REVIEWS.length ? cursor + 1 : null
    return storeReviewPageSchema.parse({ items, nextCursor })
  },
}
