import type { SVGProps } from 'react'

/**
 * 바텀 네비게이션 아이콘.
 *
 * 프로토타입 `../prototype/consumer-v3-split/index.html` 의 `90-bottom-nav` 섹션에 있는
 * 인라인 SVG path 를 **그대로** 옮긴 것 (lucide 근사·눈대중 X). viewBox 0 0 24 24 /
 * fill none / stroke currentColor / width 2 / round cap·join 은 lucide 와 동일 규약이라,
 * 색은 부모 `text-*`(currentColor), 크기는 `h-* w-*` 클래스에서 상속된다.
 */
type NavIconProps = SVGProps<SVGSVGElement>

function NavIcon({ children, ...props }: NavIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  )
}

/** 홈 */
export function HomeNavIcon(props: NavIconProps) {
  return (
    <NavIcon {...props}>
      <path d="M3 10.5L12 3l9 7.5" />
      <path d="M5 9.5V20h14V9.5" />
      <path d="M10 20v-6h4v6" />
    </NavIcon>
  )
}

/** 지도 */
export function MapNavIcon(props: NavIconProps) {
  return (
    <NavIcon {...props}>
      <path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </NavIcon>
  )
}

/** 전체 */
export function GridNavIcon(props: NavIconProps) {
  return (
    <NavIcon {...props}>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.4" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.4" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.4" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.4" />
    </NavIcon>
  )
}

/** 단골 */
export function HeartNavIcon(props: NavIconProps) {
  return (
    <NavIcon {...props}>
      <path d="M12 20s-7-4.3-9.2-9C1.5 8 3 4.5 6.5 4.5c2.2 0 3.6 1.4 4.5 2.8.9-1.4 2.3-2.8 4.5-2.8 3.5 0 5 3.5 3.7 6.5C19 15.7 12 20 12 20z" />
    </NavIcon>
  )
}

/** 주문 */
export function OrdersNavIcon(props: NavIconProps) {
  return (
    <NavIcon {...props}>
      <path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" />
      <path d="M9.5 8h5M9.5 12h5" />
    </NavIcon>
  )
}

/** 마이 */
export function UserNavIcon(props: NavIconProps) {
  return (
    <NavIcon {...props}>
      <circle cx="12" cy="8" r="3.6" />
      <path d="M5 20c0-3.8 3.1-6.5 7-6.5s7 2.7 7 6.5" />
    </NavIcon>
  )
}
