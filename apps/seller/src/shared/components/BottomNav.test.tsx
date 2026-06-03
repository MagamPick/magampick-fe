import { describe, expect, it } from 'vitest'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { render, screen } from '@testing-library/react'
import { BottomNav } from './BottomNav'

function renderNav(path = '/') {
  const router = createMemoryRouter([{ path: '*', element: <BottomNav /> }], {
    initialEntries: [path],
  })
  render(<RouterProvider router={router} />)
}

describe('BottomNav (사장 바텀네비)', () => {
  // 프로토타입 owner-v3 90-bottom-nav 는 4탭(홈·주문·통계·마이)이지만 사장 앱은 상품 탭을 더한 5탭.
  it('홈_주문_상품_통계_마이_5개_탭을_순서대로_렌더', () => {
    renderNav()
    const labels = screen.getAllByRole('link').map((a) => a.textContent)
    expect(labels).toEqual(['홈', '주문', '상품', '통계', '마이'])
  })

  it('각_탭이_올바른_경로로_연결', () => {
    renderNav()
    expect(screen.getByText('홈').closest('a')).toHaveAttribute('href', '/')
    expect(screen.getByText('주문').closest('a')).toHaveAttribute('href', '/orders')
    expect(screen.getByText('상품').closest('a')).toHaveAttribute('href', '/products')
    expect(screen.getByText('통계').closest('a')).toHaveAttribute('href', '/analytics')
    expect(screen.getByText('마이').closest('a')).toHaveAttribute('href', '/mypage')
  })

  it('현재_경로의_탭만_active_색상_적용', () => {
    renderNav('/products')
    expect(screen.getByText('상품').closest('a')).toHaveClass('text-primary')
    expect(screen.getByText('홈').closest('a')).toHaveClass('text-placeholder')
  })
})
