import { Store } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

/**
 * 매장/상품 썸네일 — 이미지 있으면 cover, 없으면 크림 톤 배경 + 매장 아이콘 폴백.
 * (프로토타입은 이모지+tint 그라데이션이었으나, 실제 API 이미지로 자연 교체되도록 폴백만 둔다.)
 */
export function Thumbnail({
  src,
  className,
  iconClassName,
}: {
  src: string | null
  className?: string
  iconClassName?: string
}) {
  return (
    <span className={cn('flex items-center justify-center overflow-hidden bg-secondary', className)}>
      {src ? (
        <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
      ) : (
        <Store className={cn('text-primary/35', iconClassName)} aria-hidden />
      )}
    </span>
  )
}
