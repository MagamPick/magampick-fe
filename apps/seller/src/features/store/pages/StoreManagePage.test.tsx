import { describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router'
import { render, screen } from '@testing-library/react'
import { createQueryWrapper } from '@/shared/test/queryWrapper'
import { StoreManagePage } from './StoreManagePage'

function renderPage() {
  const QueryWrapper = createQueryWrapper()
  return render(
    <QueryWrapper>
      <MemoryRouter>
        <StoreManagePage />
      </MemoryRouter>
    </QueryWrapper>,
  )
}

describe('StoreManagePage', () => {
  it('화면_셸_배경을_bg_card로_유지', () => {
    const { container } = renderPage()

    expect(container.firstElementChild).toHaveClass('mx-auto', 'max-w-md', 'bg-card')
    expect(container.firstElementChild).not.toHaveClass('bg-background')
  })

  it('매장 정보 수정 메뉴가 /store/edit 링크로 활성화된다 (준비중 아님)', () => {
    renderPage()
    const link = screen.getByRole('link', { name: /매장 정보 수정/ })
    expect(link).toHaveAttribute('href', '/store/edit')
    expect(link).not.toHaveTextContent('준비중')
  })
})
