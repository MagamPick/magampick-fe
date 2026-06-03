import * as React from 'react'

import { cn } from '@/shared/lib/utils'

// 멀티라인 입력 (픽업 메모·리뷰 후기 등). 프로토타입 1.5px border·라운드 10·포커스 primary 링.
function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'flex min-h-14 w-full resize-none rounded-[10px] border-[1.5px] border-border bg-card px-3 py-2.5 text-[13px] leading-relaxed text-foreground outline-none transition-[color,box-shadow] placeholder:text-placeholder focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-secondary disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
