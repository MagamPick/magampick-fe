import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ComingSoonProvider } from '@/shared/components/ComingSoonToast'
import { MenuTab } from './MenuTab'
import { useStoreMenu } from '../hooks/useStoreMenu'
import type { StoreMenuItem } from '../types'

vi.mock('../hooks/useStoreMenu')

const menu: StoreMenuItem[] = [
  { id: 'm1', name: '소금빵', imageUrl: null, price: 3000, category: '베이커리' },
  { id: 'm2', name: '통밀 캄파뉴', imageUrl: null, price: 8000, category: '베이커리' },
  { id: 'm3', name: '아메리카노', imageUrl: null, price: 4000, category: '음료' },
]

function mockMenu(items: StoreMenuItem[]) {
  vi.mocked(useStoreMenu).mockReturnValue({
    data: items,
    isPending: false,
    isError: false,
  } as unknown as ReturnType<typeof useStoreMenu>)
}

describe('MenuTab', () => {
  it('카테고리별_그룹화_노출', () => {
    mockMenu(menu)
    render(
      <ComingSoonProvider>
        <MenuTab storeId="st-1" businessStatus="OPEN" />
      </ComingSoonProvider>,
    )
    expect(screen.getByRole('heading', { name: '베이커리' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '음료' })).toBeInTheDocument()
    expect(screen.getByText('소금빵')).toBeInTheDocument()
    expect(screen.getByText('아메리카노')).toBeInTheDocument()
  })

  it('메뉴_0건이면_빈안내', () => {
    mockMenu([])
    render(
      <ComingSoonProvider>
        <MenuTab storeId="st-1" businessStatus="OPEN" />
      </ComingSoonProvider>,
    )
    expect(screen.getByText('등록된 메뉴가 없어요.')).toBeInTheDocument()
  })
})
