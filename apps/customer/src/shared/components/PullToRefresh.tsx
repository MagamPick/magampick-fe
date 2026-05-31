import type { ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { usePullToRefresh } from '../hooks/usePullToRefresh'

/** 당겨서 새로고침 래퍼 — 최상단에서 당기면 스피너 노출 후 onRefresh. 데스크탑에선 비활성. */
export function PullToRefresh({
  onRefresh,
  children,
}: {
  onRefresh: () => Promise<unknown>
  children: ReactNode
}) {
  const { pullDistance, isRefreshing, handlers } = usePullToRefresh(onRefresh)
  const offset = isRefreshing ? 56 : pullDistance
  const active = offset > 0

  return (
    <div {...handlers}>
      {active && (
        <div
          className="pointer-events-none flex items-end justify-center overflow-hidden"
          style={{ height: offset }}
        >
          <Loader2
            className={cn('mb-2 size-5 text-primary', isRefreshing && 'animate-spin')}
            style={{ opacity: Math.min(1, offset / 56) }}
            aria-hidden
          />
        </div>
      )}
      <div
        className={cn(!isRefreshing && pullDistance === 0 && 'transition-transform')}
        style={offset ? { transform: `translateY(${Math.min(offset, 8)}px)` } : undefined}
      >
        {children}
      </div>
    </div>
  )
}
