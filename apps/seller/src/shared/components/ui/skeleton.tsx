import type { ComponentProps } from 'react'
import { cn } from '@/shared/lib/utils'

/** shadcn Skeleton 프리미티브 — 로딩 중 회색 뼈대 한 조각 (토큰 bg-muted + animate-pulse). */
function Skeleton({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn('animate-pulse rounded-md bg-muted', className)}
      {...props}
    />
  )
}

export { Skeleton }
