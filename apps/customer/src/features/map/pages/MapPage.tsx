import { useState } from 'react'
import { useNavigate } from 'react-router'
import { SearchBarButton } from '@/shared/components/SearchBarButton'
import { ROUTES } from '@/shared/lib/routes'
import { MapFilterBar } from '../components/MapFilterBar'
import { KakaoMapView } from '../components/KakaoMapView'
import { StorePreviewCard } from '../components/StorePreviewCard'
import { useGeolocation } from '@/shared/hooks/useGeolocation'
import { useMapStores } from '../hooks/useMapStores'
import { DEFAULT_MAP_DISTANCE, type MapDistance, type MapStore } from '../types'
import { useAddresses } from '@/features/addresses/hooks/useAddresses'

/**
 * 지도 기반 매장 조회 (소비자) — 탭 셸 `/map`. 카카오맵 위 현재 위치(GPS, fallback 기본 주소지) 중심 매장 마커.
 * 거리(1/3/5km)·"마감 할인 판매 중" 필터 → 변경 즉시 마커 갱신. 마커 탭 = 하단 미니카드, 카드 탭 = 매장 상세.
 * 세션 저장 X(MVP) — 화면 재진입 시 default(3km · 토글 ON) 초기화. 노션: 지도 기반 매장 조회.
 *
 * 탭 셸(TabLayout)은 본문 하단에 플로팅 바텀네비용 패딩을 주지만, 지도는 풀블리드여야 하므로
 * 같은 값의 음수 마진으로 상쇄 → 지도가 네비 뒤까지 차고 미니카드만 네비 위로 띄운다.
 */
export function MapPage() {
  const navigate = useNavigate()
  const [distance, setDistance] = useState<MapDistance>(DEFAULT_MAP_DISTANCE)
  const [dealsOnly, setDealsOnly] = useState(true)
  const [selected, setSelected] = useState<MapStore | null>(null)

  // GPS 거부/실패 시 기본 주소지 좌표로 fallback (노션 정책)
  const { data: addresses } = useAddresses()
  const defaultAddress = addresses?.find((a) => a.isDefault)
  const { position, isReady } = useGeolocation(
    defaultAddress ? { latitude: defaultAddress.latitude, longitude: defaultAddress.longitude } : null,
  )

  const { data: stores = [] } = useMapStores(
    isReady
      ? {
          latitude: position.latitude,
          longitude: position.longitude,
          radiusKm: distance,
          dealsOnly,
        }
      : null,
  )

  // 필터 변경으로 선택 매장이 마커 목록에서 빠지면 미니카드를 닫는다(stale 카드 방지)
  const selectedVisible = selected !== null && stores.some((s) => s.id === selected.id)

  return (
    <section className="relative flex flex-1 flex-col -mb-[calc(64px+8px+env(safe-area-inset-bottom,24px)+12px)]">
      <div className="flex-shrink-0 border-b border-border bg-card pt-[calc(env(safe-area-inset-top,0px)+4px)]">
        <SearchBarButton />
        <MapFilterBar
          distance={distance}
          onDistanceChange={(d) => {
            setDistance(d)
            setSelected(null)
          }}
          dealsOnly={dealsOnly}
          onDealsOnlyChange={(on) => {
            setDealsOnly(on)
            setSelected(null)
          }}
        />
      </div>

      <KakaoMapView
        stores={stores}
        center={position}
        radiusKm={distance}
        selectedId={selectedVisible ? selected.id : null}
        onStoreSelect={setSelected}
      />

      {selectedVisible && (
        <StorePreviewCard
          store={selected}
          onClick={() => navigate(ROUTES.STORE_DETAIL(selected.id))}
        />
      )}
    </section>
  )
}
