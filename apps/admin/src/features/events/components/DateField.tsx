import { useState } from 'react'
import { CalendarIcon } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover'
import { Calendar } from '@/shared/components/ui/calendar'
import { cn } from '@/shared/lib/utils'
import { parseYMD, toYMD } from '../lib/eventFormat'

interface DateFieldProps {
  /** "yyyy-MM-dd" | "" */
  value: string
  onChange: (value: string) => void
  /** 이 날짜 미만 비활성 ("yyyy-MM-dd") — 생성 시 today 전달 */
  disabledBefore?: string
  ariaLabel: string
  placeholder?: string
  invalid?: boolean
  disabled?: boolean
}

/**
 * 날짜 입력 — 트리거 버튼 + Popover 안 Calendar. value ↔ "yyyy-MM-dd".
 * (seller StoreRegisterForm 의 Sheet+Calendar 패턴을 데스크톱 Popover 로 치환)
 */
export function DateField({
  value,
  onChange,
  disabledBefore,
  ariaLabel,
  placeholder = '날짜 선택',
  invalid,
  disabled,
}: DateFieldProps) {
  const [open, setOpen] = useState(false)
  const selected = value ? parseYMD(value) : undefined
  const before = disabledBefore ? parseYMD(disabledBefore) : undefined

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={ariaLabel}
          disabled={disabled}
          className={cn(
            'flex h-11 w-full items-center justify-between rounded-[10px] border-[1.5px] border-input bg-card px-3.5 text-[15px] outline-none transition-[color,box-shadow] focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-secondary disabled:cursor-not-allowed disabled:opacity-50',
            invalid && 'border-destructive',
          )}
        >
          <span className={cn(value ? 'text-foreground' : 'text-muted-foreground')}>
            {value || placeholder}
          </span>
          <CalendarIcon className="size-[18px] text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          defaultMonth={selected ?? before}
          disabled={before ? { before } : undefined}
          onSelect={(d) => {
            onChange(d ? toYMD(d) : '')
            if (d) setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
