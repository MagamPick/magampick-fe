import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router'
import { ComingSoonProvider } from '@/shared/components/ComingSoonToast'
import { MenuTab } from './MenuTab'
import { useStoreMenu } from '../hooks/useStoreMenu'
import type { StoreMenuItem } from '../types'

vi.mock('../hooks/useStoreMenu')

const menu: StoreMenuItem[] = [
  { id: 1, name: '소금빵', imageUrl: null, price: 3000, category: '베이커리' },
  { id: 2, name: '통밀 캄파뉴', imageUrl: null, price: 8000, category: '베이커리' },
  { id: 3, name: '아메리카노', imageUrl: null, price: 4000, category: '음료' },
]

function LocationDisplay() {
  const loc = useLocation()
  return <div data-testid="loc">{loc.pathname + loc.search}</div>
}

function mockMenu(items: StoreMenuItem[]) {
  vi.mocked(useStoreMenu).mockReturnValue({
    data: items,
    isPending: false,
    isError: false,
  } as unknown as ReturnType<typeof useStoreMenu>)
}

function renderTab() {
  return render(
    <MemoryRouter initialEntries={['/store/1']}>
      <ComingSoonProvider>
        <Routes>
          <Route path="/store/:id" element={<MenuTab storeId={1} businessStatus="OPEN" />} />
          <Route path="/product/:kind/:productId" element={<LocationDisplay />} />
        </Routes>
      </ComingSoonProvider>
    </MemoryRouter>,
  )
}

describe('MenuTab', () => {
  it('카테고리별_그룹화_노출', () => {
    mockMenu(menu)
    renderTab()
    expect(screen.getByRole('heading', { name: '베이커리' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '음료' })).toBeInTheDocument()
    expect(screen.getByText('소금빵')).toBeInTheDocument()
    expect(screen.getByText('아메리카노')).toBeInTheDocument()
  })

  it('메뉴_0건이면_빈안내', () => {
    mockMenu([])
    renderTab()
    expect(screen.getByText('등록된 메뉴가 없어요.')).toBeInTheDocument()
  })

  it('메뉴_탭하면_상품상세로_이동', async () => {
    const user = userEvent.setup()
    mockMenu(menu)
    renderTab()

    await user.click(screen.getByText('소금빵'))
    expect(screen.getByTestId('loc')).toHaveTextContent('/product/menu/1')
  })
})
