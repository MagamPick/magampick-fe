import type { ElementType, ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'

type ScreenVariant = 'page' | 'tab' | 'bleed'

/**
 * 화면 셸 — 배경을 항상 `bg-card`(흰색)로 박아 "페이지마다 배경을 직접 고르다 회색으로 까는" 실수를 차단.
 * 프로토타입 `.screen { background: var(--surface) }` = 흰색이고, `bg-background`(#f7f7f7 회색)는
 * 페이지 배경이 아니라 칩/플로팅 네비 뒤 인셋에만 쓴다 (styling-convention "화면 배경" 규칙 참조).
 *
 * - `page` : 풀스크린 페이지(데스크탑 가운데 정렬). 자체 헤더/뒤로가기 보유 화면.
 * - `tab`  : 탭 레이아웃 안에서 본문만 채우는 탭 화면.
 * - `bleed`: max-w 없이 꽉 채우는 풀블리드(히어로 이미지·지도 등).
 */
const VARIANT: Record<ScreenVariant, string> = {
  page: 'mx-auto flex min-h-screen max-w-md flex-col bg-card',
  tab: 'flex flex-1 flex-col bg-card',
  bleed: 'min-h-screen bg-card',
}

interface ScreenContainerProps {
  variant?: ScreenVariant
  /** 렌더할 엘리먼트 (기본 div). 시맨틱이 필요하면 'main' 등 */
  as?: ElementType
  className?: string
  children: ReactNode
}

export function ScreenContainer({ variant = 'page', as, className, children }: ScreenContainerProps) {
  const Comp = as ?? 'div'
  return <Comp className={cn(VARIANT[variant], className)}>{children}</Comp>
}
