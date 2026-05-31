import type { ReactNode } from 'react'
import { ChevronLeft, Heart, Share2 } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Thumbnail } from '@/shared/components/Thumbnail'

/** 매장 상세 헤더 히어로 — 대표 사진 + 오버레이(뒤로가기·공유·단골 토글) */
export function StoreHero({
  imageUrl,
  isFavorite,
  favoritePending = false,
  onBack,
  onShare,
  onToggleFavorite,
}: {
  imageUrl: string | null
  isFavorite: boolean
  favoritePending?: boolean
  onBack: () => void
  onShare: () => void
  onToggleFavorite: () => void
}) {
  return (
    <div className="relative h-[218px] flex-shrink-0">
      <Thumbnail src={imageUrl} className="h-full w-full" iconClassName="size-16" />
      <div className="absolute inset-x-[10px] top-[calc(env(safe-area-inset-top,0px)+8px)] flex items-center gap-2">
        <HeroButton label="뒤로 가기" onClick={onBack}>
          <ChevronLeft className="size-[22px]" aria-hidden />
        </HeroButton>
        <span className="flex-1" />
        <HeroButton label="공유" onClick={onShare}>
          <Share2 className="size-5" aria-hidden />
        </HeroButton>
        <HeroButton
          label={isFavorite ? '단골 해제' : '단골 등록'}
          pressed={isFavorite}
          active={isFavorite}
          disabled={favoritePending}
          onClick={onToggleFavorite}
        >
          <Heart className={cn('size-5', isFavorite && 'fill-current')} aria-hidden />
        </HeroButton>
      </div>
    </div>
  )
}

function HeroButton({
  children,
  label,
  onClick,
  active = false,
  pressed,
  disabled = false,
}: {
  children: ReactNode
  label: string
  onClick: () => void
  active?: boolean
  pressed?: boolean
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex size-11 flex-shrink-0 items-center justify-center rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.16)] disabled:opacity-60',
        active ? 'bg-primary text-white' : 'bg-white/95 text-foreground',
      )}
    >
      {children}
    </button>
  )
}
