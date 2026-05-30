import type { ComponentType, SVGProps } from 'react'
import {
  GridNavIcon,
  HeartNavIcon,
  HomeNavIcon,
  MapNavIcon,
  OrdersNavIcon,
  UserNavIcon,
} from './icons/navIcons'

export interface TabItem {
  id: string
  label: string
  /**
   * 탭 경로 (임시값). 라우터 연결은 이번 PR 범위 밖 — login/logout 머지 후 별도 PR 에서
   * `shared/lib/routes.ts` 의 ROUTES 상수로 정리한다. 지금은 NavLink active 표시 검증용.
   */
  to: string
  /** index 경로('/')는 정확히 일치할 때만 active (NavLink end) */
  end?: boolean
  Icon: ComponentType<SVGProps<SVGSVGElement>>
}

/**
 * 바텀 네비 탭 — 프로토타입 consumer-v3-split `90-bottom-nav` 의 순서·라벨·아이콘 그대로.
 * (홈 · 지도 · 전체 · 단골 · 주문 · 마이)
 */
export const TABS: TabItem[] = [
  { id: 'home', label: '홈', to: '/', end: true, Icon: HomeNavIcon },
  { id: 'map', label: '지도', to: '/map', Icon: MapNavIcon },
  { id: 'all', label: '전체', to: '/all', Icon: GridNavIcon },
  { id: 'favs', label: '단골', to: '/favs', Icon: HeartNavIcon },
  { id: 'orders', label: '주문', to: '/orders', Icon: OrdersNavIcon },
  { id: 'mypage', label: '마이', to: '/mypage', Icon: UserNavIcon },
]
