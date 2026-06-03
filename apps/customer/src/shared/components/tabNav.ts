import type { ComponentType, SVGProps } from 'react'
import { ROUTES } from '@/shared/lib/routes'
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
  /** 탭 경로 (ROUTES 상수) — `TabLayout` 의 자식 라우트와 1:1 매핑 */
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
  { id: 'home', label: '홈', to: ROUTES.HOME, end: true, Icon: HomeNavIcon },
  { id: 'map', label: '지도', to: ROUTES.MAP, Icon: MapNavIcon },
  { id: 'all', label: '전체', to: ROUTES.ALL, Icon: GridNavIcon },
  { id: 'favs', label: '단골', to: ROUTES.FAVS, Icon: HeartNavIcon },
  { id: 'orders', label: '주문', to: ROUTES.ORDERS, Icon: OrdersNavIcon },
  { id: 'mypage', label: '마이', to: ROUTES.MYPAGE, Icon: UserNavIcon },
]
