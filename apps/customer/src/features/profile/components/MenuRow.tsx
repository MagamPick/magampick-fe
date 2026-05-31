import { Link } from 'react-router'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

interface MenuRowProps {
  /** 좌측 이모지 아이콘 */
  icon: string
  label: string
  /** 우측 보조 값 (미구현 기능은 생략 — 가짜 카운트 X) */
  value?: string
  /** 링크 이동 (live 라우트) */
  to?: string
  /** 버튼 동작 (준비중 토스트 / 로그아웃 등) */
  onClick?: () => void
  /** 위험 동작(로그아웃·탈퇴) — 빨강 + chevron 없음 */
  danger?: boolean
}

/** 프로토타입 03-components `.menu-row` 스펙 — gap 11 · py14 px16 · min-h54 · 하단 구분선 */
const ROW =
  'flex min-h-[54px] w-full items-center gap-[11px] border-b border-border px-4 py-3.5 text-left last:border-b-0'

/**
 * 마이페이지 메뉴 행 (프로토타입 25-mypage). `to`=링크 / `onClick`=버튼 / 둘 다 없으면 정적(앱 버전).
 * chevron 은 상호작용 행이면서 danger 가 아닐 때만 노출(프로토타입: 로그아웃·탈퇴·앱버전엔 없음).
 */
export function MenuRow({ icon, label, value, to, onClick, danger }: MenuRowProps) {
  const interactive = Boolean(to || onClick)
  const showChevron = interactive && !danger

  const inner = (
    <>
      <span aria-hidden className="w-[22px] shrink-0 text-center text-[17px]">
        {icon}
      </span>
      <span
        className={cn(
          'flex-1 text-[14.5px] font-medium',
          danger ? 'text-destructive' : 'text-foreground',
        )}
      >
        {label}
      </span>
      {value && <span className="text-[13px] font-semibold text-muted-foreground">{value}</span>}
      {showChevron && <ChevronRight className="size-[18px] shrink-0 text-[#bdbdbd]" aria-hidden />}
    </>
  )

  if (to) {
    return (
      <Link to={to} className={ROW}>
        {inner}
      </Link>
    )
  }
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={ROW}>
        {inner}
      </button>
    )
  }
  return <div className={ROW}>{inner}</div>
}
