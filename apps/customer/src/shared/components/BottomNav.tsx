import { NavLink } from 'react-router'
import { cn } from '@/shared/lib/utils'
import { TABS } from './tabNav'

/**
 * 바텀 네비게이션 — 프로토타입 consumer-v3-split 의 `.bottom-nav`
 * (배민 스타일 frosted-glass 플로팅 바) 재현. CSS 수치는 `styles/03-components.css` 에서 추출.
 *
 * ⚠️ 디자인 토큰 세트에 없는 **일회성 수치**(radius 22 · blur 20 · saturate 1.8 · 전용 그림자 ·
 * label 10.5px · letter-spacing -0.2px · padding 9/6 · gap 3 · scale 0.94 · z 45 · 비활성색
 * #BDBDBD)는 styling-convention §5(정당한 일회성) 예외로 임의값 사용. 공유 파일 `globals.css`
 * 는 건드리지 않는다(이 PR = 새 컴포넌트 파일만). `text-disabled #BDBDBD` 는 디자인 토큰이지만
 * 아직 globals.css 에 없어 인라인 — 토큰 추가 시 `text-*` 유틸로 교체.
 *
 * 프로토타입은 `.phone` 프레임 안 `position:absolute` 였으나, 실제 PWA 뷰포트에선 `fixed` 로
 * 변환하고 하단 여백은 노치 안전영역(`env`) + 8px (안전영역 없으면 24px 폴백 = 프로토 수치)로 교정.
 */
export function BottomNav() {
  return (
    <nav
      aria-label="메인 네비게이션"
      className={cn(
        'fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom,24px)+8px)] z-[45]',
        'flex h-16 overflow-hidden rounded-[22px]',
        'border border-white/55 bg-white/[0.78]',
        'backdrop-blur-[20px] backdrop-saturate-[1.8]',
        'shadow-[0_10px_30px_rgba(0,0,0,0.10),0_4px_10px_rgba(0,0,0,0.05)]',
      )}
    >
      {TABS.map(({ id, label, to, end, Icon }) => (
        <NavLink
          key={id}
          to={to}
          end={end}
          className={({ isActive }) =>
            cn(
              'flex flex-1 flex-col items-center gap-[3px] pt-[9px] pb-1.5',
              'transition-transform duration-100 active:scale-[0.94]',
              isActive ? 'text-primary' : 'text-[#bdbdbd]',
            )
          }
        >
          <Icon className="h-6 w-6" />
          <span className="max-w-full truncate text-[10.5px] font-semibold tracking-[-0.2px]">
            {label}
          </span>
        </NavLink>
      ))}
    </nav>
  )
}
