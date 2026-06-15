import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'

/** 빈 상태 안내 — 아이콘 + 안내 문구 + 선택적 CTA. (seller EmptyState 미러) */
export function EmptyState({
  icon,
  children,
  action,
  className,
}: {
  icon: ReactNode
  children: ReactNode
  /** 선택적 CTA — 메시지 아래 중앙 정렬로 노출 */
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('px-5 py-14 text-center', className)}>
      <div className="flex justify-center text-muted-foreground [&>svg]:size-14" aria-hidden>
        {icon}
      </div>
      <div className="mt-3 text-sm font-semibold text-muted-foreground">{children}</div>
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  )
}
