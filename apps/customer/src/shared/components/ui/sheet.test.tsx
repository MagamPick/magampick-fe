import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Sheet, SheetContent, SheetTitle } from './sheet'

describe('SheetContent', () => {
  it('bottom_sheet를_customer_max_width_컬럼에_맞춰_표시', () => {
    render(
      <Sheet open>
        <SheetContent side="bottom" aria-describedby={undefined}>
          <SheetTitle>바텀시트</SheetTitle>
        </SheetContent>
      </Sheet>,
    )

    const sheet = screen.getByRole('dialog')
    expect(sheet).toHaveClass('bottom-0', 'left-1/2', 'w-full', 'max-w-md', '-translate-x-1/2')
    expect(sheet).not.toHaveClass('inset-x-0')
  })

  it('시트_배경을_bg_card로_표시', () => {
    render(
      <Sheet open>
        <SheetContent side="bottom" aria-describedby={undefined}>
          <SheetTitle>바텀시트</SheetTitle>
        </SheetContent>
      </Sheet>,
    )

    // 시트는 콘텐츠 패널이라 흰색(bg-card) — 프로토타입 `.sheet { background: var(--surface) }` 와 동일.
    // bg-background(회색) 아님. seller sheet 와 통일.
    const sheet = screen.getByRole('dialog')
    expect(sheet).toHaveClass('bg-card')
    expect(sheet).not.toHaveClass('bg-background')
  })
})
