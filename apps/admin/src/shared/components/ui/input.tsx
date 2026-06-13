import * as React from "react"

import { cn } from "@/shared/lib/utils"

// 프로토타입 .field__input — h50 / border 1.5px / radius-input(10px) / 15px / focus shadow primary-light
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-[50px] w-full min-w-0 rounded-[10px] border-[1.5px] border-input bg-card px-3.5 text-[15px] text-foreground outline-none transition-[color,box-shadow]",
        "selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground",
        "focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-secondary",
        "read-only:cursor-default read-only:bg-background",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
        className,
      )}
      {...props}
    />
  )
}

export { Input }
