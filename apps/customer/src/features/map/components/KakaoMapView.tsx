import { useEffect, useRef, useState } from 'react'
import type { GeoPosition } from '@/shared/hooks/useGeolocation'
import type { MapDistance, MapStore } from '../types'

/**
 * 카카오맵 위 매장 마커 + 내 위치. 노션 "지도 기반 매장 조회".
 * - 중심 = 현재 위치(GPS, fallback 기본 주소지). 드래그/줌 해도 마커는 항상 중심 기준(결과 재계산 X) — 지도는 시점 이동 도구.
 * - 마커: 활성 떨이 보유 = 오렌지 말풍선 + 최대 할인율%, 없으면 회색 점. 선택 시 진한색. 매장당 1개.
 * - 클러스터링 X(MVP). SDK 는 index.html `<script ...autoload=false>` → `kakao.maps.load(cb)` 로 준비 보장.
 */
const LEVEL_BY_RADIUS: Record<MapDistance, number> = { 1: 5, 3: 6, 5: 7 }

/** 마커 DOM — 인라인 스타일(토큰 CSS 변수)로 그려 Tailwind 정적 스캔과 무관하게 동적 색 적용. 프로토타입 .map-pin */
function createMarkerEl(store: MapStore, selected: boolean, onClick: () => void): HTMLElement {
  const hasDeal = store.activeDealCount > 0
  const bg = hasDeal
    ? selected
      ? 'var(--secondary-foreground)'
      : 'var(--primary)'
    : selected
      ? 'var(--muted-foreground)'
      : 'var(--placeholder)'
  const el = document.createElement('button')
  el.type = 'button'
  el.setAttribute('aria-label', `${store.name} 지도 마커`)
  el.style.cssText =
    'border:none; background:none; padding:0; cursor:pointer; display:flex; flex-direction:column; align-items:center;'
  el.innerHTML =
    `<span style="background:${bg}; color:#fff; font-size:${hasDeal ? 11 : 13}px; font-weight:800;` +
    ` padding:5px 9px; border-radius:11px; box-shadow:0 3px 8px rgba(0,0,0,.28); white-space:nowrap; line-height:1;">` +
    `${hasDeal ? `${store.maxDiscountRate}%` : '·'}</span>` +
    `<span style="width:2px; height:7px; background:${bg};"></span>`
  el.addEventListener('click', onClick)
  return el
}

/** 내 위치 파란 점 (프로토타입 .map-me) */
function createMeEl(): HTMLElement {
  const el = document.createElement('div')
  el.setAttribute('aria-label', '내 위치')
  el.style.cssText =
    'width:18px; height:18px; border-radius:50%; background:var(--info); border:3px solid #fff; box-shadow:0 0 0 5px rgba(13,110,253,.22);'
  return el
}

export function KakaoMapView({
  stores,
  center,
  radiusKm,
  selectedId,
  onStoreSelect,
}: {
  stores: MapStore[]
  center: GeoPosition
  radiusKm: MapDistance
  selectedId: string | null
  onStoreSelect: (store: MapStore) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<kakao.maps.Map | null>(null)
  const overlaysRef = useRef<kakao.maps.CustomOverlay[]>([])
  const meRef = useRef<kakao.maps.CustomOverlay | null>(null)
  const [mapReady, setMapReady] = useState(false)
  // 마운트 시 SDK(window.kakao) 미존재면 에러로 시작(렌더 직후 동기 setState 회피). index.html head script 로 보통 마운트 전 로드됨.
  const [sdkError] = useState(() => !window.kakao?.maps?.load)

  // 1) SDK 로드 → 지도 1회 생성(center/radius 초기값). 이후 갱신은 아래 effect 들이 담당.
  useEffect(() => {
    const kakao = window.kakao
    if (!kakao?.maps?.load) return
    kakao.maps.load(() => {
      const container = containerRef.current
      if (!container) return
      const map = new kakao.maps.Map(container, {
        center: new kakao.maps.LatLng(center.latitude, center.longitude),
        level: LEVEL_BY_RADIUS[radiusKm],
      })
      mapRef.current = map
      map.relayout()
      setMapReady(true)
    })
    return () => {
      overlaysRef.current.forEach((o) => o.setMap(null))
      meRef.current?.setMap(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 2) 중심 좌표 변경 → setCenter + 내 위치 오버레이 재배치
  useEffect(() => {
    if (!mapReady || !mapRef.current) return
    const kakao = window.kakao
    const pos = new kakao.maps.LatLng(center.latitude, center.longitude)
    mapRef.current.setCenter(pos)
    meRef.current?.setMap(null)
    meRef.current = new kakao.maps.CustomOverlay({
      position: pos,
      content: createMeEl(),
      map: mapRef.current,
      xAnchor: 0.5,
      yAnchor: 0.5,
      zIndex: 1,
    })
  }, [center, mapReady])

  // 3) 반경 변경 → 줌 레벨(중심 유지)
  useEffect(() => {
    if (!mapReady || !mapRef.current) return
    mapRef.current.setLevel(LEVEL_BY_RADIUS[radiusKm])
  }, [radiusKm, mapReady])

  // 4) 매장/선택 변경 → 마커 재생성(매장 수 적어 전체 재생성)
  useEffect(() => {
    if (!mapReady || !mapRef.current) return
    const kakao = window.kakao
    overlaysRef.current.forEach((o) => o.setMap(null))
    overlaysRef.current = stores.map(
      (store) =>
        new kakao.maps.CustomOverlay({
          position: new kakao.maps.LatLng(store.latitude, store.longitude),
          content: createMarkerEl(store, store.id === selectedId, () => onStoreSelect(store)),
          map: mapRef.current!,
          xAnchor: 0.5,
          yAnchor: 1,
          zIndex: store.id === selectedId ? 3 : 2,
          clickable: true,
        }),
    )
  }, [stores, selectedId, mapReady, onStoreSelect])

  return (
    <div className="relative flex-1">
      <div ref={containerRef} className="absolute inset-0 bg-[#e8efe6]" />

      {sdkError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background px-8 text-center">
          <span className="text-2xl">🗺️</span>
          <p className="text-sm font-bold text-foreground">지도를 불러오지 못했어요</p>
          <p className="text-xs text-muted-foreground">
            카카오맵 키(VITE_KAKAO_MAP_KEY)와 플랫폼 도메인 등록을 확인해 주세요.
          </p>
        </div>
      )}

      {!sdkError && mapReady && stores.length === 0 && (
        <div className="pointer-events-none absolute left-1/2 top-1/2 w-[78%] max-w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-[16px] bg-card/95 px-4 py-[22px] text-center shadow-[0_8px_26px_rgba(0,0,0,0.12)]">
          <div className="text-[32px]">🌙</div>
          <p className="mt-2.5 text-sm font-extrabold text-foreground">이 반경에는 매장이 없어요</p>
          <p className="mt-1.5 text-[12.5px] text-muted-foreground">반경을 더 넓게 조정해보세요.</p>
        </div>
      )}
    </div>
  )
}
