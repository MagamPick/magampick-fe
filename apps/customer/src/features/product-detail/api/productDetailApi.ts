import { productDetailSchema, type ProductDetail, type ProductKind } from '../types'

/**
 * ⚠️ Mock 스텁 — 상품 상세 BE(BE 완료 NO)가 아직이라 가짜 응답.
 * BE 완료 후 `apiClient` 실제 호출 + Zod 응답 검증으로 교체 (api-client-convention).
 * 거리·영업상태·상품 단위 평점은 BE/DB 책임 — mock 은 "이미 계산된" 응답을 반환.
 * 일반/떨이는 BE 별도 모델이지만 본 화면은 한 응답 형태(discriminated union)로 받는다.
 */
const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

/** 픽업 마감을 "지금 ± m분" 으로 — 카운트다운이 항상 라이브하도록 */
const minutesFromNow = (m: number) => new Date(Date.now() + m * 60_000).toISOString()
const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString()
const UNSPLASH = (id: string) =>
  `https://images.unsplash.com/${id}?w=720&h=720&fit=crop&q=80&auto=format`

/** fixture — 알려진 id 는 그대로, 그 외엔 defaultProduct 결정적 시드 */
const PRODUCTS: Record<string, ProductDetail> = {
  // 떨이 — 매장 상세 마감할인 탭(sd-1/2/3)과 이름·가격 일치
  'sd-1': {
    kind: 'deal',
    id: 'sd-1',
    storeId: 'st-1',
    storeName: '베이커리 브레드샵',
    distanceKm: 0.3,
    businessStatus: 'OPEN',
    imageUrl: UNSPLASH('photo-1555507036-ab1f4038808a'),
    name: '크루아상 세트 (4개입)',
    description: '갓 구운 버터 크루아상 4개 구성. 마감 시간 전 픽업해 주세요.',
    rating: 4.8,
    reviewCount: 36,
    originalPrice: 9000,
    salePrice: 4500,
    discountRate: 50,
    pickupDeadline: minutesFromNow(35),
    stockLeft: 5,
    dealStatus: 'ACTIVE',
  },
  'sd-2': {
    kind: 'deal',
    id: 'sd-2',
    storeId: 'st-1',
    storeName: '베이커리 브레드샵',
    distanceKm: 0.3,
    businessStatus: 'OPEN',
    imageUrl: null,
    name: '호밀 식빵 1봉',
    description: null,
    rating: 4.6,
    reviewCount: 21,
    originalPrice: 7500,
    salePrice: 4500,
    discountRate: 40,
    pickupDeadline: minutesFromNow(52),
    stockLeft: 3,
    dealStatus: 'ACTIVE',
  },
  'sd-3': {
    kind: 'deal',
    id: 'sd-3',
    storeId: 'st-1',
    storeName: '베이커리 브레드샵',
    distanceKm: 0.3,
    businessStatus: 'OPEN',
    imageUrl: UNSPLASH('photo-1509440159596-0249088772ff'),
    name: '오늘의 샌드위치',
    description: '그날 준비한 재료로 만든 샌드위치. 수량 한정이에요.',
    rating: 4.7,
    reviewCount: 44,
    originalPrice: 6000,
    salePrice: 3900,
    discountRate: 35,
    pickupDeadline: minutesFromNow(78),
    stockLeft: 8,
    dealStatus: 'ACTIVE',
  },
  // 떨이 — 차단 상태(직접 URL 진입 시 확인용)
  'sd-sold': {
    kind: 'deal',
    id: 'sd-sold',
    storeId: 'st-1',
    storeName: '베이커리 브레드샵',
    distanceKm: 0.3,
    businessStatus: 'OPEN',
    imageUrl: UNSPLASH('photo-1568827999250-3f6afff96e66'),
    name: '마감 임박 베이글 세트',
    description: '인기 떨이라 빠르게 소진됐어요.',
    rating: 4.5,
    reviewCount: 18,
    originalPrice: 8000,
    salePrice: 4000,
    discountRate: 50,
    pickupDeadline: minutesFromNow(20),
    stockLeft: 0,
    dealStatus: 'SOLD_OUT',
  },
  'sd-expired': {
    kind: 'deal',
    id: 'sd-expired',
    storeId: 'st-1',
    storeName: '베이커리 브레드샵',
    distanceKm: 0.3,
    businessStatus: 'OPEN',
    imageUrl: null,
    name: '저녁 마감 모둠빵',
    description: '오늘 픽업 마감 시간이 지났어요.',
    rating: 4.4,
    reviewCount: 9,
    originalPrice: 10000,
    salePrice: 5500,
    discountRate: 45,
    pickupDeadline: minutesAgo(5),
    stockLeft: 2,
    dealStatus: 'EXPIRED',
  },
  'sd-break': {
    kind: 'deal',
    id: 'sd-break',
    storeId: 'st-break',
    storeName: '커피로스터스 합정',
    distanceKm: 0.5,
    businessStatus: 'BREAK',
    imageUrl: UNSPLASH('photo-1495474472287-4d71bcdd2085'),
    name: '브레이크 타임 케이크',
    description: '잠시 휴식 중인 매장의 떨이예요.',
    rating: 4.6,
    reviewCount: 27,
    originalPrice: 7000,
    salePrice: 4200,
    discountRate: 40,
    pickupDeadline: minutesFromNow(40),
    stockLeft: 4,
    dealStatus: 'ACTIVE',
  },
  // 일반 상품 — 매장 상세 메뉴 탭(mn-1)과 일치
  'mn-1': {
    kind: 'menu',
    id: 'mn-1',
    storeId: 'st-1',
    storeName: '베이커리 브레드샵',
    distanceKm: 0.3,
    businessStatus: 'OPEN',
    imageUrl: null,
    name: '플레인 크루아상',
    description: '매일 아침 굽는 기본 크루아상이에요.',
    rating: 4.5,
    reviewCount: 12,
    price: 3500,
    isOnSale: true,
  },
  // 일반 상품 — 판매 OFF + 리뷰 0건(직접 URL 진입 시 확인용)
  'mn-off': {
    kind: 'menu',
    id: 'mn-off',
    storeId: 'st-1',
    storeName: '베이커리 브레드샵',
    distanceKm: 0.3,
    businessStatus: 'OPEN',
    imageUrl: null,
    name: '시즌 한정 무화과 타르트',
    description: null,
    rating: 0,
    reviewCount: 0,
    price: 6800,
    isOnSale: false,
  },
}

const DEFAULT_STORE_NAMES = [
  '데일리 브레드',
  '북카페 무드',
  '브레드앤버터',
  '오븐 베이커리',
  '카페 모리',
]
const DEFAULT_DEAL_NAMES = ['마감 특가 모둠빵', '오늘의 떨이 세트', '마감 샌드위치', '남은 빵 한 봉']
const DEFAULT_MENU_NAMES = ['아메리카노', '카페 라떼', '소금빵', '바스크 치즈케이크', '마들렌 3종']

/** 알 수 없는 id(홈/매장 카드 등에서 진입)도 항상 상품을 반환 — id·kind 기준 결정적 시드 */
function defaultProduct(kind: ProductKind, id: string): ProductDetail {
  const hash = [...id].reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  const common = {
    id,
    storeId: `st-${(hash % 5) + 1}`,
    storeName: DEFAULT_STORE_NAMES[hash % DEFAULT_STORE_NAMES.length],
    distanceKm: Math.round((0.3 + (hash % 9) * 0.1) * 10) / 10,
    businessStatus: 'OPEN' as const,
    imageUrl: null,
    description: '신선하게 준비한 상품이에요.',
    rating: Math.round((4.3 + (hash % 6) * 0.1) * 10) / 10,
    reviewCount: 12 + (hash % 180),
  }
  if (kind === 'deal') {
    const originalPrice = 6000 + (hash % 6) * 1000
    const discountRate = 30 + (hash % 5) * 5
    const salePrice = Math.round((originalPrice * (100 - discountRate)) / 100 / 100) * 100
    return {
      ...common,
      kind: 'deal',
      name: DEFAULT_DEAL_NAMES[hash % DEFAULT_DEAL_NAMES.length],
      originalPrice,
      salePrice,
      discountRate,
      pickupDeadline: minutesFromNow(30 + (hash % 60)),
      stockLeft: 1 + (hash % 8),
      dealStatus: 'ACTIVE',
    }
  }
  return {
    ...common,
    kind: 'menu',
    name: DEFAULT_MENU_NAMES[hash % DEFAULT_MENU_NAMES.length],
    price: 3000 + (hash % 6) * 500,
    isOnSale: true,
  }
}

/** 매장별 마감 시각(HH:mm) — 장바구니 픽업 슬롯 생성용. 알 수 없는 매장은 기본 21:00 */
const STORE_CLOSING: Record<string, string> = {
  'st-1': '21:00',
  'st-break': '20:00',
}
const closingFor = (storeId: string) => STORE_CLOSING[storeId] ?? '21:00'

export const productDetailApi = {
  async getProductDetail(kind: ProductKind, id: string): Promise<ProductDetail> {
    await delay(350)
    const base = PRODUCTS[id] ?? defaultProduct(kind, id)
    return productDetailSchema.parse({
      ...base,
      closingTime: base.closingTime ?? closingFor(base.storeId),
    })
  },
}
