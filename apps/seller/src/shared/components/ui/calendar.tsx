import * as React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { DayPicker } from 'react-day-picker'
import { ko } from 'react-day-picker/locale'

import { cn } from '@/shared/lib/utils'
import { buttonVariants } from '@/shared/components/ui/button'

// shadcn Calendar (react-day-picker v10) — 마감픽 토큰 적용. 주로 단일 날짜 선택용.
function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      locale={ko}
      className={cn('p-3', className)}
      classNames={{
        months: 'relative flex w-full flex-col',
        month: 'flex w-full flex-col gap-4',
        month_caption: 'flex h-9 items-center justify-center',
        caption_label: 'text-sm font-bold text-foreground',
        nav: 'absolute inset-x-0 top-0 flex h-9 items-center justify-between',
        button_previous: cn(
          buttonVariants({ variant: 'ghost', size: 'icon-sm' }),
          'text-muted-foreground hover:text-foreground',
        ),
        button_next: cn(
          buttonVariants({ variant: 'ghost', size: 'icon-sm' }),
          'text-muted-foreground hover:text-foreground',
        ),
        month_grid: 'w-full border-collapse',
        weekdays: 'flex',
        weekday: 'flex-1 text-center text-[12px] font-semibold text-muted-foreground',
        week: 'mt-1 flex w-full',
        day: 'flex-1 p-0.5 text-center text-sm',
        day_button: cn(
          buttonVariants({ variant: 'ghost', size: 'icon-sm' }),
          'h-11 w-full rounded-lg font-normal aria-selected:bg-primary aria-selected:text-primary-foreground aria-selected:hover:bg-primary',
        ),
        today: 'font-bold text-primary',
        outside: 'text-muted-foreground/40',
        disabled: 'text-muted-foreground/30 opacity-50',
        hidden: 'invisible',
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === 'left' ? (
            <ChevronLeft className="size-4" />
          ) : (
            <ChevronRight className="size-4" />
          ),
      }}
      {...props}
    />
  )
}

export { Calendar }
