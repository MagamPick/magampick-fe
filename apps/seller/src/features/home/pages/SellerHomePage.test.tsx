import { describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router'
import { render } from '@testing-library/react'
import { createQueryWrapper } from '@/shared/test/queryWrapper'
import { SellerHomePage } from './SellerHomePage'

describe('SellerHomePage', () => {
  it('화면_셸_배경을_bg_card로_유지', () => {
    const Wrapper = createQueryWrapper()
    const { container } = render(
      <Wrapper>
        <MemoryRouter>
          <SellerHomePage />
        </MemoryRouter>
      </Wrapper>,
    )

    // 탭 셸(TabLayout)이 max-w-md·중앙정렬을 담당하므로 페이지는 본문만(tab variant) — 배경 흰색만 검증
    expect(container.firstElementChild).toHaveClass('bg-card')
    expect(container.firstElementChild).not.toHaveClass('bg-background')
  })
})
