import { useEffect, useRef, useState } from 'react'
import { Clock } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { HOUR_OPTIONS, MINUTE_OPTIONS, splitTime, joinTime } from '../lib/businessHours'

interface Props {
  /** "HH:MM" */
  value: string
  onChange: (value: string) => void
  /** 접근성/식별 라벨 (예: "오픈 시각") */
  ariaLabel: string
  disabled?: boolean
}

/** 패널 높이 추정값 — 아래 공간이 이보다 좁으면 위로 펼침 */
const PANEL_EST = 240

function Column({
  label,
  options,
  value,
  onPick,
}: {
  label: string
  options: string[]
  value: string
  onPick: (v: string) => void
}) {
  return (
    <div className="flex-1">
      <div className="border-b border-border py-1.5 text-center text-[12px] font-bold text-muted-foreground">
        {label}
      </div>
      <ul role="listbox" aria-label={label} className="max-h-40 overflow-y-auto py-1">
        {options.map((opt) => (
          <li key={opt}>
            <button
              type="button"
              role="option"
              aria-selected={opt === value}
              onClick={() => onPick(opt)}
              className={cn(
                'w-full px-3 py-1.5 text-center text-[16px] font-semibold',
                opt === value ? 'bg-secondary text-secondary-foreground' : 'text-foreground',
              )}
            >
              {opt}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * 시각 선택 — 트리거 1개 → 한 패널에서 시·분을 함께 고른다 (native time picker 미사용).
 * 값은 "HH:MM" 한 덩어리. 아래 공간이 좁으면 위로 펼쳐 화면 밖으로 나가지 않게 한다. 밖 클릭 시 닫힘.
 */
export function TimePicker({ value, onChange, ariaLabel, disabled }: Props) {
  const [open, setOpen] = useState(false)
  const [openUp, setOpenUp] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const { hour, minute } = splitTime(value)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  function toggle() {
    if (!open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setOpenUp(window.innerHeight - rect.bottom < PANEL_EST)
    }
    setOpen((o) => !o)
  }

  return (
    <div ref={ref} className="relative flex-1">
      <button
        ref={triggerRef}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="dialog"
        aria-expanded={open}
        disabled={disabled}
        onClick={toggle}
        className="flex h-[52px] w-full items-center justify-between rounded-[12px] border-[1.5px] border-input bg-card px-4 text-[18px] font-bold tracking-[1px] text-foreground outline-none transition focus:border-primary focus:ring-[3px] focus:ring-secondary disabled:cursor-not-allowed"
      >
        {value}
        <Clock className="size-[18px] text-muted-foreground" aria-hidden />
      </button>

      {open && !disabled && (
        <div
          className={cn(
            'absolute inset-x-0 z-50 flex overflow-hidden rounded-[12px] border border-border bg-popover shadow-e3',
            openUp ? 'bottom-[calc(100%+4px)]' : 'top-[calc(100%+4px)]',
          )}
        >
          <Column
            label="시"
            options={HOUR_OPTIONS}
            value={hour}
            onPick={(h) => onChange(joinTime(h, minute))}
          />
          <div className="w-px shrink-0 bg-border" />
          <Column
            label="분"
            options={MINUTE_OPTIONS}
            value={minute}
            onPick={(m) => onChange(joinTime(hour, m))}
          />
        </div>
      )}
    </div>
  )
}
