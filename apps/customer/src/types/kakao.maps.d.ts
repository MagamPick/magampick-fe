/**
 * 카카오맵 JS SDK 최소 타입 선언 (지도 기반 매장 조회 `/map`).
 * 의존성 추가(@types/kakao.maps) 없이 우리가 실제로 쓰는 API 표면만 선언한다.
 * SDK 는 index.html 의 `<script ...sdk.js?...&autoload=false>` 로 로드 →
 * `window.kakao.maps.load(cb)` 로 준비 완료를 보장한 뒤 사용.
 */
export {}

declare global {
  interface Window {
    kakao: typeof kakao
  }

  namespace kakao.maps {
    /** autoload=false 일 때 SDK 준비 완료 콜백 */
    function load(callback: () => void): void

    class LatLng {
      constructor(latitude: number, longitude: number)
      getLat(): number
      getLng(): number
    }

    interface MapOptions {
      center: LatLng
      /** 줌 레벨 — 작을수록 확대(1~14) */
      level: number
      draggable?: boolean
    }

    class Map {
      constructor(container: HTMLElement, options: MapOptions)
      setCenter(latlng: LatLng): void
      setLevel(level: number): void
      getLevel(): number
      setBounds(bounds: LatLngBounds): void
      relayout(): void
    }

    /** 두 좌표를 모두 담는 영역 — 매장 위치 화면에서 내 위치+매장이 한눈에 보이게 초기 맞춤 */
    class LatLngBounds {
      constructor()
      extend(latlng: LatLng): void
    }

    interface CustomOverlayOptions {
      position: LatLng
      content: HTMLElement | string
      map?: Map | null
      xAnchor?: number
      yAnchor?: number
      zIndex?: number
      clickable?: boolean
    }

    class CustomOverlay {
      constructor(options: CustomOverlayOptions)
      setMap(map: Map | null): void
      setPosition(position: LatLng): void
    }

    type StrokeStyle = 'solid' | 'shortdash' | 'shortdot' | 'dash' | 'dot' | 'dashdot'

    interface PolylineOptions {
      path: LatLng[]
      strokeWeight?: number
      strokeColor?: string
      strokeOpacity?: number
      strokeStyle?: StrokeStyle
      map?: Map | null
    }

    /** 내 위치 ↔ 매장 직선 점선 연결 (매장 위치 화면) */
    class Polyline {
      constructor(options: PolylineOptions)
      setMap(map: Map | null): void
    }

    namespace event {
      /** zoom_changed 등 지도 이벤트 구독 — 줌 변경 시 축척 라벨 동기화 */
      function addListener(target: object, type: string, handler: () => void): void
    }
  }
}
