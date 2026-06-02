import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'

/** 빈 상태 안내 (프로토타입 `.empty-state`) — 큰 이모지 + 안내 문구. 소비자 EmptyState 미러. */
export function EmptyState({
  icon,
  children,
  className,
}: {
  icon: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('px-5 py-14 text-center', className)}>
      <div className="text-[44px]" aria-hidden>
        {icon}
      </div>
      <div className="mt-3 text-sm font-semibold text-muted-foreground">{children}</div>
    </div>
  )
}
