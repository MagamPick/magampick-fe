import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'

/** 빈 상태 안내 (프로토타입 `.empty-state`) — 아이콘 + 안내 문구 + 선택적 CTA */
export function EmptyState({
  icon,
  children,
  action,
  className,
}: {
  icon: ReactNode
  children: ReactNode
  /** 선택적 CTA (예: "쿠폰 받으러 가기" 버튼/링크) — 메시지 아래 중앙 정렬로 노출 */
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex min-h-[50vh] flex-col items-center justify-center px-5 py-10 text-center', className)}>
      <div className="flex justify-center text-muted-foreground [&>svg]:size-14" aria-hidden>
        {icon}
      </div>
      <div className="mt-3 text-sm font-semibold text-muted-foreground">{children}</div>
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  )
}
