import { mapStoreSchema, type MapStore, type MapStoresParams } from '../types'

/**
 * ⚠️ Mock 스텁 — 지도 기반 매장 조회 BE(BE 완료 NO)가 아직이라 가짜 응답.
 * BE 완료 후 `apiClient` 실제 호출 + Zod 응답 검증으로 교체 (api-client-convention).
 *
 * 노션 정책: 운영상태(OPEN+영업요일)·거리는 BE/DB(ADR-003 PostGIS) 책임 → mock 도 "이미 필터된"
 * 결과를 반환(FE 는 거리 재계산 X). 지도 드래그/줌은 결과 재계산 X — 마커는 항상 중심 좌표 기준.
 * 그래서 mock 은 중심 좌표(latitude/longitude)를 받되 거리(distanceKm)는 고정값을 쓰고,
 * 반경·마감 할인 토글만 적용한다(BE 가 PostGIS 로 중심 기준 거리 계산하는 걸 흉내).
 *
 * id·이름·평점·할인 값은 전체 매장 조회(storeListApi)와 동일 매장(같은 매장이 두 화면에서 일관),
 * 좌표(latitude/longitude)만 지도용으로 추가. 마커 탭 → 매장 상세(storeDetailApi)는 id fallback 으로 동작.
 */
const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))
const UNSPLASH = (id: string) =>
  `https://images.unsplash.com/${id}?w=320&h=320&fit=crop&q=80&auto=format`

/** 서울 마포구(홍대·합정·연남) 일대 — 기본 주소지 fallback 좌표(37.5571, 126.925) 주변에 분산 */
const STORES: MapStore[] = [
  {
    id: 'st-1',
    name: '베이커리 브레드샵',
    imageUrl: UNSPLASH('photo-1555507036-ab1f4038808a'),
    latitude: 37.556,
    longitude: 126.9262,
    distanceKm: 0.3,
    rating: 4.6,
    activeDealCount: 2,
    maxDiscountRate: 40,
  },
  {
    id: 'sl-1',
    name: '데일리 브레드',
    imageUrl: null,
    latitude: 37.5588,
    longitude: 126.923,
    distanceKm: 0.5,
    rating: 4.4,
    activeDealCount: 3,
    maxDiscountRate: 45,
  },
  {
    id: 'nb-1',
    name: '북카페 무드',
    imageUrl: UNSPLASH('photo-1481833761820-0509d3217039'),
    latitude: 37.5545,
    longitude: 126.9228,
    distanceKm: 0.6,
    rating: 4.8,
    activeDealCount: 1,
    maxDiscountRate: 30,
  },
  {
    id: 'nb-3',
    name: '브레드앤버터',
    imageUrl: UNSPLASH('photo-1509440159596-0249088772ff'),
    latitude: 37.5598,
    longitude: 126.928,
    distanceKm: 0.9,
    rating: 4.7,
    activeDealCount: 4,
    maxDiscountRate: 55,
  },
  {
    id: 'sl-2',
    name: '수제버거 그릴',
    imageUrl: null,
    latitude: 37.5522,
    longitude: 126.9295,
    distanceKm: 1.1,
    rating: 4.5,
    activeDealCount: 1,
    maxDiscountRate: 25,
  },
  {
    id: 'sl-3',
    name: '베이글 공방',
    imageUrl: null,
    latitude: 37.551,
    longitude: 126.92,
    distanceKm: 1.3,
    rating: 4.3,
    activeDealCount: 0,
    maxDiscountRate: 0,
  },
  {
    id: 'sl-4',
    name: '국수나무 서교',
    imageUrl: null,
    latitude: 37.5632,
    longitude: 126.9215,
    distanceKm: 1.5,
    rating: 4.2,
    activeDealCount: 2,
    maxDiscountRate: 35,
  },
  {
    id: 'sl-5',
    name: '오븐 베이커리',
    imageUrl: null,
    latitude: 37.5485,
    longitude: 126.9318,
    distanceKm: 1.8,
    rating: 4.1,
    activeDealCount: 1,
    maxDiscountRate: 20,
  },
  {
    id: 'sl-6',
    name: '마라탕 후오궈',
    imageUrl: null,
    latitude: 37.5655,
    longitude: 126.916,
    distanceKm: 2.0,
    rating: 3.9,
    activeDealCount: 3,
    maxDiscountRate: 50,
  },
  {
    id: 'sl-7',
    name: '샐러드볼 서교',
    imageUrl: null,
    latitude: 37.5455,
    longitude: 126.9185,
    distanceKm: 2.4,
    rating: 4.9,
    activeDealCount: 1,
    maxDiscountRate: 28,
  },
  {
    id: 'sl-8',
    name: '카페 모리',
    imageUrl: null,
    latitude: 37.5695,
    longitude: 126.9345,
    distanceKm: 2.9,
    rating: 4.0,
    activeDealCount: 0,
    maxDiscountRate: 0,
  },
  {
    id: 'sl-9',
    name: '새벽 두부집',
    imageUrl: null,
    latitude: 37.5435,
    longitude: 126.9395,
    distanceKm: 3.2,
    rating: 0,
    activeDealCount: 0,
    maxDiscountRate: 0,
  },
]

export const mapApi = {
  /**
   * 중심 좌표 기준 반경 안의 매장 마커. dealsOnly=true 면 활성 떨이 보유 매장만.
   * (latitude/longitude 는 BE 계약상 전달하지만 mock 은 고정 distanceKm 로 필터 — 위 주석 참조.)
   */
  async getMapStores({ radiusKm, dealsOnly }: MapStoresParams): Promise<MapStore[]> {
    await delay(300)
    const visible = STORES.filter((s) => {
      if (s.distanceKm > radiusKm) return false
      if (dealsOnly && s.activeDealCount === 0) return false
      return true
    })
    return mapStoreSchema.array().parse(visible)
  },
}
