import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router'
import { createQueryWrapper } from '@/shared/test/queryWrapper'
import { StoreLocationPage } from './StoreLocationPage'
import { useStoreDetail } from '../hooks/useStoreDetail'
import { useAddresses } from '@/features/addresses/hooks/useAddresses'
import { useGeolocation } from '@/shared/hooks/useGeolocation'
import { haversineKm } from '../lib/geoDistance'
import { walkAndDistanceLabel } from '../lib/walkTime'
import { formatDistance } from '@/shared/lib/formatDistance'
import type { StoreDetail } from '../types'

vi.mock('../hooks/useStoreDetail')
vi.mock('@/features/addresses/hooks/useAddresses')
vi.mock('@/shared/hooks/useGeolocation')
// 카카오 SDK(jsdom 미존재) 회피 — 카드 검증이 목적이라 지도는 스텁
vi.mock('../components/StoreLocationMap', () => ({
  StoreLocationMap: () => null,
}))

const STORE: StoreDetail = {
  id: 1,
  name: '브레드샵',
  imageUrl: null,
  businessStatus: 'OPEN',
  closingTime: '21:00',
  rating: 4.8,
  reviewCount: 10,
  distanceKm: 0.3, // BE = 기본 주소지 기준 (GPS 와 다름)
  isFavorite: false,
  address: '서울 마포구',
  phone: '02-1234-5678',
  businessNumber: '123-45-67890',
  operatingHours: [],
  lat: 37.55,
  lng: 126.92,
}

// GPS 현재 위치 — 기본 주소지(매장 근처)와 멀리 떨어진 강남역 부근
const GPS = { latitude: 37.4979, longitude: 127.0276, source: 'gps' as const }

function renderPage() {
  const Wrapper = createQueryWrapper()
  return render(
    <Wrapper>
      <MemoryRouter initialEntries={['/store/1/location']}>
        <Routes>
          <Route path="/store/:id/location" element={<StoreLocationPage />} />
        </Routes>
      </MemoryRouter>
    </Wrapper>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(useStoreDetail).mockReturnValue({
    data: STORE,
  } as unknown as ReturnType<typeof useStoreDetail>)
  vi.mocked(useAddresses).mockReturnValue({
    // 기본 주소지 = 매장 근처 (GPS 와 명확히 다른 좌표)
    data: [{ isDefault: true, latitude: 37.55, longitude: 126.92 }],
  } as unknown as ReturnType<typeof useAddresses>)
  vi.mocked(useGeolocation).mockReturnValue({
    position: GPS,
    isReady: true,
  })
})

describe('StoreLocationPage 카드 거리 (A3-6)', () => {
  it('카드_거리는_GPS_기준_haversine_이고_store_distanceKm_가_아니다', () => {
    renderPage()

    const expectedKm = haversineKm(GPS, { latitude: STORE.lat, longitude: STORE.lng })
    // GPS≠기본주소지라 BE distanceKm(0.3km)와 확연히 다른 거리여야 함 (안전망)
    expect(expectedKm).toBeGreaterThan(5)

    // GPS 기준 거리(formatDistance)가 평점 라인 + 도보 라인 양쪽에 노출 (지도 점선과 같은 기준점)
    const distRe = new RegExp(formatDistance(expectedKm).replace('.', '\\.'))
    expect(screen.getAllByText(distRe)).toHaveLength(2)

    // 도보 라벨도 GPS 기준 값
    expect(screen.getByText(walkAndDistanceLabel(expectedKm), { exact: false })).toBeInTheDocument()

    // 기본 주소지 기준 BE 거리(0.3km)는 노출되지 않아야 함
    expect(screen.queryByText(/0\.3km/)).not.toBeInTheDocument()
  })
})
