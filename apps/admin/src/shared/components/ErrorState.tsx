import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'
import { Button } from './ui/button'

/** 에러 안내 — 큰 이모지 + 안내 문구 + 선택적 "다시 시도"(refetch). EmptyState 와 같은 레이아웃. */
export function ErrorState({
  icon = '⚠️',
  children,
  onRetry,
  retryLabel = '다시 시도',
  className,
}: {
  icon?: string
  children?: ReactNode
  onRetry?: () => void
  retryLabel?: string
  className?: string
}) {
  return (
    <div className={cn('px-5 py-14 text-center', className)}>
      <div className="text-[44px]" aria-hidden>
        {icon}
      </div>
      <div className="mt-3 text-sm font-semibold text-muted-foreground">
        {children ?? '지금은 불러오지 못했어요. 잠시 후 다시 시도해주세요.'}
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
          {retryLabel}
        </Button>
      )}
    </div>
  )
}
