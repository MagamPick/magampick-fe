import { Star } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { RATING_LABELS } from '../types'

interface Props {
  /** 0 = 미선택, 1~5 */
  value: number
  onChange: (rating: number) => void
  disabled?: boolean
}

/**
 * 별점 입력 — 별 5개 클릭(1~5). 프로토타입 52-review-write(rw-stars).
 * value 0 = 미선택. 아래 라벨로 선택 점수 안내.
 */
export function RatingInput({ value, onChange, disabled }: Props) {
  return (
    <div>
      <div className="flex justify-center gap-1.5" role="radiogroup" aria-label="별점 선택">
        {Array.from({ length: 5 }, (_, i) => {
          const star = i + 1
          const filled = star <= value
          return (
            <button
              key={star}
              type="button"
              role="radio"
              aria-checked={star === value}
              aria-label={`${star}점`}
              disabled={disabled}
              onClick={() => onChange(star)}
              className="flex size-11 items-center justify-center transition-transform active:scale-90 disabled:cursor-not-allowed"
            >
              {/* 별점 색은 디자인 토큰 유틸로 노출되지 않아 hex 직접(ProductReviewSummary 선례) */}
              <Star
                className={cn(
                  'size-8',
                  filled ? 'fill-[#FFC107] text-[#FFC107]' : 'fill-[#E5E5E5] text-[#E5E5E5]',
                )}
              />
            </button>
          )
        })}
      </div>
      <p
        className={cn(
          'mt-1 min-h-[22px] text-center text-sm font-bold',
          value > 0 ? 'font-extrabold text-primary' : 'text-muted-foreground',
        )}
      >
        {value > 0 ? RATING_LABELS[value - 1] : '별점을 선택해 주세요'}
      </p>
    </div>
  )
}
