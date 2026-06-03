import { ChevronLeft } from 'lucide-react'
import { Thumbnail } from '@/shared/components/Thumbnail'

/** 상품 상세 상단 — 헤더 바(뒤로·"상품") + 대표 사진 1장 */
export function ProductHero({ imageUrl, onBack }: { imageUrl: string | null; onBack: () => void }) {
  return (
    <div className="flex-shrink-0">
      <header className="sticky top-0 z-20 flex h-[52px] items-center gap-1 border-b border-border bg-card px-2">
        <button
          type="button"
          aria-label="뒤로 가기"
          onClick={onBack}
          className="flex size-10 items-center justify-center rounded-full text-foreground"
        >
          <ChevronLeft className="size-[22px]" aria-hidden />
        </button>
        <span className="text-base font-bold">상품</span>
      </header>
      <Thumbnail src={imageUrl} className="h-[240px] w-full" iconClassName="size-16" />
    </div>
  )
}
