import { cn } from '@/shared/lib/utils'
import { QUICK_TAGS } from '../types'
import type { QuickTag } from '../types'

interface Props {
  value: string[]
  onChange: (tags: string[]) => void
}

/** 빠른 평가 태그 — 복수 선택 칩. 프로토타입 52-review-write(rw-quick) */
export function QuickTagPicker({ value, onChange }: Props) {
  function toggle(tag: QuickTag) {
    onChange(value.includes(tag) ? value.filter((t) => t !== tag) : [...value, tag])
  }

  return (
    <div className="flex flex-wrap gap-2">
      {QUICK_TAGS.map((tag) => {
        const on = value.includes(tag)
        return (
          <button
            key={tag}
            type="button"
            aria-pressed={on}
            onClick={() => toggle(tag)}
            className={cn(
              'inline-flex min-h-10 items-center rounded-[18px] border-[1.5px] px-3.5 text-[13px] font-semibold transition-colors',
              on
                ? 'border-primary bg-secondary font-extrabold text-secondary-foreground'
                : 'border-border bg-card text-muted-foreground',
            )}
          >
            {tag}
          </button>
        )
      })}
    </div>
  )
}
