import { useEffect, useRef, useState } from 'react'
import { Map, Minus, Plus } from 'lucide-react'
import type { GeoPosition } from '@/shared/hooks/useGeolocation'

/**
 * '매장 위치' 화면 지도 — 카카오맵 위 내 위치(파란 점) + 매장 마커 + 둘을 잇는 직선 점선.
 * 두 점이 한눈에 보이게 초기 맞춤(setBounds), 줌 컨트롤·축척 노출. 단일 매장 전용(메인 지도 탭과 무관).
 * 노션 "매장 상세 조회 (소비자)" 의 매장 위치 sub-route. 외부 길찾기 API 호출 X.
 */
const MIN_LEVEL = 1
const MAX_LEVEL = 10
/** 카카오맵 줌 레벨 → 축척 라벨(미터) */
const SCALE_LABEL: Record<number, string> = {
  1: '20m',
  2: '30m',
  3: '50m',
  4: '100m',
  5: '250m',
  6: '500m',
  7: '1km',
  8: '2km',
  9: '4km',
  10: '8km',
}
const PRIMARY = '#FF6B35'

function createMeEl(): HTMLElement {
  const el = document.createElement('div')
  el.setAttribute('aria-label', '내 위치')
  el.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:6px;'
  el.innerHTML =
    '<span style="width:18px;height:18px;border-radius:50%;background:var(--info);border:3px solid #fff;box-shadow:0 0 0 5px rgba(13,110,253,.22);"></span>' +
    '<span style="background:rgba(26,26,26,.85);color:#fff;padding:3px 9px;border-radius:10px;font-size:11px;font-weight:700;white-space:nowrap;">내 위치</span>'
  return el
}

function createStoreEl(name: string): HTMLElement {
  const el = document.createElement('div')
  el.setAttribute('aria-label', `${name} 위치`)
  el.style.cssText = 'display:flex;flex-direction:column;align-items:center;'
  el.innerHTML =
    `<span style="background:${PRIMARY};color:#fff;font-size:12px;font-weight:700;padding:6px 11px;` +
    `border-radius:12px;box-shadow:0 3px 10px rgba(0,0,0,.3);white-space:nowrap;">${name}</span>` +
    `<span style="width:2px;height:8px;background:${PRIMARY};"></span>`
  return el
}

export function StoreLocationMap({
  lat,
  lng,
  name,
  myPosition,
}: {
  lat: number
  lng: number
  name: string
  myPosition: GeoPosition
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<kakao.maps.Map | null>(null)
  const layersRef = useRef<Array<{ setMap: (map: kakao.maps.Map | null) => void }>>([])
  const [mapReady, setMapReady] = useState(false)
  const [level, setLevel] = useState(5)
  // 마운트 시 SDK 미존재면 에러로 시작(렌더 직후 동기 setState 회피)
  const [sdkError] = useState(() => !window.kakao?.maps?.load)

  // 1) SDK 로드 → 지도 1회 생성 + 줌 변경 시 축척 동기화 리스너
  useEffect(() => {
    const kakao = window.kakao
    if (!kakao?.maps?.load) return
    kakao.maps.load(() => {
      const container = containerRef.current
      if (!container) return
      const map = new kakao.maps.Map(container, {
        center: new kakao.maps.LatLng(lat, lng),
        level: 5,
      })
      mapRef.current = map
      map.relayout()
      kakao.maps.event.addListener(map, 'zoom_changed', () => setLevel(map.getLevel()))
      setMapReady(true)
    })
    return () => {
      layersRef.current.forEach((layer) => layer.setMap(null))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 2) 좌표/내 위치 변경 → 내 위치·매장 마커·점선 재배치 + 두 점 한눈에 맞춤
  useEffect(() => {
    if (!mapReady || !mapRef.current) return
    const kakao = window.kakao
    const map = mapRef.current
    layersRef.current.forEach((layer) => layer.setMap(null))

    const me = new kakao.maps.LatLng(myPosition.latitude, myPosition.longitude)
    const store = new kakao.maps.LatLng(lat, lng)

    layersRef.current = [
      new kakao.maps.CustomOverlay({
        position: me,
        content: createMeEl(),
        map,
        xAnchor: 0.5,
        yAnchor: 0.5,
        zIndex: 2,
      }),
      new kakao.maps.CustomOverlay({
        position: store,
        content: createStoreEl(name),
        map,
        xAnchor: 0.5,
        yAnchor: 1,
        zIndex: 3,
      }),
      new kakao.maps.Polyline({
        path: [me, store],
        strokeWeight: 3,
        strokeColor: PRIMARY,
        strokeOpacity: 0.85,
        strokeStyle: 'shortdash',
        map,
      }),
    ]

    const bounds = new kakao.maps.LatLngBounds()
    bounds.extend(me)
    bounds.extend(store)
    map.setBounds(bounds)
    setLevel(map.getLevel())
  }, [lat, lng, name, myPosition, mapReady])

  const zoom = (delta: number) => {
    const map = mapRef.current
    if (!map) return
    map.setLevel(Math.min(MAX_LEVEL, Math.max(MIN_LEVEL, map.getLevel() + delta)))
    // level state 는 zoom_changed 리스너가 갱신
  }

  return (
    <div className="relative h-[480px] flex-shrink-0 overflow-hidden bg-[#e8efe6]">
      <div ref={containerRef} className="absolute inset-0" />

      {sdkError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background px-8 text-center">
          <Map className="size-7 text-muted-foreground" aria-hidden />
          <p className="text-sm font-bold text-foreground">지도를 불러오지 못했어요</p>
          <p className="text-xs text-muted-foreground">
            카카오맵 키(VITE_KAKAO_MAP_KEY)와 플랫폼 도메인 등록을 확인해 주세요.
          </p>
        </div>
      )}

      {!sdkError && (
        <>
          <div className="absolute right-[14px] top-[14px] z-10 flex flex-col overflow-hidden rounded-[10px] bg-white shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
            <button
              type="button"
              aria-label="확대"
              disabled={level <= MIN_LEVEL}
              onClick={() => zoom(-1)}
              className="flex size-[38px] items-center justify-center border-b border-border text-foreground disabled:text-placeholder"
            >
              <Plus className="size-[18px]" aria-hidden />
            </button>
            <button
              type="button"
              aria-label="축소"
              disabled={level >= MAX_LEVEL}
              onClick={() => zoom(1)}
              className="flex size-[38px] items-center justify-center text-foreground disabled:text-placeholder"
            >
              <Minus className="size-[18px]" aria-hidden />
            </button>
          </div>

          <span
            aria-live="polite"
            className="pointer-events-none absolute bottom-[14px] left-[14px] z-10 rounded-[8px] bg-white/90 px-[9px] py-1 text-[11px] font-bold tabular-nums text-foreground shadow-[0_2px_6px_rgba(0,0,0,0.08)]"
          >
            {SCALE_LABEL[level] ?? ''}
          </span>
        </>
      )}
    </div>
  )
}
