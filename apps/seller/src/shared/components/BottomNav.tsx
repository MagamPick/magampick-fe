import { NavLink } from 'react-router'
import { cn } from '@/shared/lib/utils'
import { TABS } from './tabNav'

/**
 * 사장 바텀 네비게이션 — 소비자 셸의 `BottomNav` 를 미러한 frosted-glass 플로팅 바.
 * 프로토타입 owner-v3 `.bottom-nav`(styles/03-components.css)와 수치가 동일
 * (radius 22 · blur 20 · saturate 1.8 · 전용 그림자 · z 45 · 비활성 #BDBDBD).
 *
 * ⚠️ 디자인 토큰 세트에 없는 일회성 수치(label 10.5px · letter-spacing -0.2px · padding 9/6 ·
 * gap 3 · scale 0.94)는 styling-convention §5(정당한 일회성) 예외로 임의값 사용. 공유 파일
 * `globals.css` 는 건드리지 않는다. 비활성색 `#BDBDBD` 는 디자인 토큰(text-disabled)이지만
 * 아직 globals.css 에 없어 인라인 — 토큰 추가 시 `text-*` 유틸로 교체.
 *
 * 폭은 콘텐츠(`TabLayout` 의 `max-w-md`)와 동일하게 뷰포트 하단 **중앙 고정** — 데스크탑에서
 * 네비만 화면 끝까지 퍼지지 않게 한다. 모바일(≤448px)에선 좌우 12px(`px-3`) 여백. 하단은 노치
 * 안전영역(`env`) + 8px, 안전영역 없으면 24px 폴백 = 프로토 수치.
 */
export function BottomNav() {
  return (
    <nav
      aria-label="메인 네비게이션"
      className="fixed bottom-[calc(env(safe-area-inset-bottom,24px)+8px)] left-1/2 z-[45] w-full max-w-md -translate-x-1/2 px-3"
    >
      <div
        className={cn(
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
      </div>
    </nav>
  )
}
