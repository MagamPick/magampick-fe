import { BarChart3, Home, Receipt, Tag, User, type LucideIcon } from 'lucide-react'
import { ROUTES } from '@/shared/lib/routes'

export interface TabItem {
  id: string
  label: string
  /** 탭 경로 (ROUTES 상수) — `TabLayout` 의 자식 라우트와 1:1 매핑 */
  to: string
  /** index 경로('/')는 정확히 일치할 때만 active (NavLink end) */
  end?: boolean
  Icon: LucideIcon
}

/**
 * 사장 바텀 네비 탭 — 프로토타입 owner-v3 `90-bottom-nav` 의 4탭(홈·주문·통계·마이)에
 * 상품 탭(Tag)을 중앙에 더한 5탭. 소비자 셸(`apps/customer`)의 탭 구조를 미러한다.
 * 아이콘은 lucide-react 로, 프로토타입 인라인 SVG 와 1:1 (집·영수증·태그·막대그래프·사람).
 */
export const TABS: TabItem[] = [
  { id: 'home', label: '홈', to: ROUTES.HOME, end: true, Icon: Home },
  { id: 'orders', label: '주문', to: ROUTES.ORDERS, Icon: Receipt },
  { id: 'products', label: '상품', to: ROUTES.PRODUCTS, Icon: Tag },
  { id: 'analytics', label: '통계', to: ROUTES.ANALYTICS, Icon: BarChart3 },
  { id: 'mypage', label: '마이', to: ROUTES.MYPAGE, Icon: User },
]
