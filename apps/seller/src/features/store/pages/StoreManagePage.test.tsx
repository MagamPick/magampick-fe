import { describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router'
import { render } from '@testing-library/react'
import { createQueryWrapper } from '@/shared/test/queryWrapper'
import { StoreManagePage } from './StoreManagePage'

describe('StoreManagePage', () => {
  it('화면_셸_배경을_bg_card로_유지', () => {
    const QueryWrapper = createQueryWrapper()
    const { container } = render(
      <QueryWrapper>
        <MemoryRouter>
          <StoreManagePage />
        </MemoryRouter>
      </QueryWrapper>,
    )

    expect(container.firstElementChild).toHaveClass('mx-auto', 'max-w-md', 'bg-card')
    expect(container.firstElementChild).not.toHaveClass('bg-background')
  })
})
