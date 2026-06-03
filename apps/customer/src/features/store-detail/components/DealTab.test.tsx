import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router'
import { ComingSoonProvider } from '@/shared/components/ComingSoonToast'
import { DealTab } from './DealTab'
import { useStoreDeals } from '../hooks/useStoreDeals'
import type { BusinessStatus, StoreDeal } from '../types'

vi.mock('../hooks/useStoreDeals')

const deal: StoreDeal = {
  id: 'sd-1',
  name: '크루아상 세트',
  imageUrl: null,
  discountRate: 50,
  originalPrice: 9000,
  salePrice: 4500,
  pickupDeadline: new Date(Date.now() + 30 * 60_000).toISOString(),
  stockLeft: 5,
}

function LocationDisplay() {
  const loc = useLocation()
  return <div data-testid="loc">{loc.pathname + loc.search}</div>
}

function renderTab(businessStatus: BusinessStatus = 'OPEN') {
  return render(
    <MemoryRouter initialEntries={['/store/st-1']}>
      <ComingSoonProvider>
        <Routes>
          <Route
            path="/store/:id"
            element={<DealTab storeId="st-1" businessStatus={businessStatus} />}
          />
          <Route path="/product/:kind/:productId" element={<LocationDisplay />} />
        </Routes>
      </ComingSoonProvider>
    </MemoryRouter>,
  )
}

function mockDeals(deals: StoreDeal[]) {
  vi.mocked(useStoreDeals).mockReturnValue({
    data: deals,
    isPending: false,
    isError: false,
  } as unknown as ReturnType<typeof useStoreDeals>)
}

describe('DealTab', () => {
  it('떨이_있으면_배너와_카드_노출', () => {
    mockDeals([deal])
    renderTab()
    expect(screen.getByText(/픽업 가능한 마감 할인/)).toBeInTheDocument()
    expect(screen.getByText('크루아상 세트')).toBeInTheDocument()
    expect(screen.getByText('50%')).toBeInTheDocument()
  })

  it('떨이_0건이면_빈안내', () => {
    mockDeals([])
    renderTab()
    expect(screen.getByText('지금 진행 중인 마감 할인이 없어요.')).toBeInTheDocument()
  })

  it('영업외면_차단안내_표시_그리고_탭하면_상품상세로_이동', async () => {
    const user = userEvent.setup()
    mockDeals([deal])
    renderTab('CLOSED_TODAY')

    expect(screen.getByText(/영업 외 상태/)).toBeInTheDocument()
    // 영업 외여도 진입은 허용 — 차단은 상품 상세 화면이 처리
    await user.click(screen.getByText('크루아상 세트'))
    expect(screen.getByTestId('loc')).toHaveTextContent('/product/deal/sd-1')
  })
})
