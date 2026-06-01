import * as React from 'react'

import { cn } from '@/shared/lib/utils'

// 프로토타입 .field__textarea — min-h 96 / border 1.5px / radius-input(10px) / 15px / focus shadow primary-light
function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'min-h-24 w-full resize-none rounded-[10px] border-[1.5px] border-input bg-card px-3.5 py-3 text-[15px] leading-relaxed text-foreground outline-none transition-[color,box-shadow]',
        'placeholder:text-[#bdbdbd]',
        'focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-secondary',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
