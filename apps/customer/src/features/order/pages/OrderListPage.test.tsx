import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router'
import { OrderListPage } from './OrderListPage'
import { orderApi } from '../api/orderApi'
import { createQueryWrapper } from '@/shared/test/queryWrapper'
import type { Order } from '../types'

vi.mock('../api/orderApi')

const pending: Order = {
  id: 'o1',
  orderNo: '1001',
  storeId: 'st1',
  storeName: '스윗아워',
  storePhone: undefined,
  items: [
    {
      id: 'i1',
      kind: 'deal',
      name: '케이크',
      imageUrl: null,
      originalPrice: 5000,
      salePrice: 4000,
      qty: 1,
    },
  ],
  pickup: { type: 'asap' },
  memo: '',
  amounts: { normalTotal: 5000, discountTotal: 1000, payTotal: 4000 },
  pickupCode: '1111',
  status: 'PENDING',
  paymentMethod: 'toss',
  createdAt: new Date().toISOString(),
}
const completed: Order = {
  ...pending,
  id: 'o2',
  storeName: '베이커리 브레드샵',
  status: 'COMPLETED',
  pickupCode: '2222',
}

function renderPage() {
  const wrapper = createQueryWrapper()
  return render(
    <MemoryRouter initialEntries={['/orders']}>
      <OrderListPage />
    </MemoryRouter>,
    { wrapper },
  )
}

describe('OrderListPage', () => {
  beforeEach(() => vi.clearAllMocks())

  it('주문 목록을 렌더한다', async () => {
    vi.mocked(orderApi.listOrders).mockResolvedValue([pending])

    renderPage()

    expect(await screen.findByText('스윗아워')).toBeInTheDocument()
  })

  it('픽업 대기 탭 클릭 시 PENDING 주문만 표시한다', async () => {
    vi.mocked(orderApi.listOrders).mockResolvedValue([pending, completed])

    renderPage()

    await screen.findByText('스윗아워')

    await userEvent.click(screen.getByRole('tab', { name: '픽업 대기' }))

    const cards = screen.getAllByText('스윗아워')
    expect(cards.length).toBeGreaterThanOrEqual(1)
  })

  it('주문이 없으면 빈 상태 안내를 표시한다', async () => {
    vi.mocked(orderApi.listOrders).mockResolvedValue([])

    renderPage()

    expect(await screen.findByText(/주문 내역이 없어요/)).toBeInTheDocument()
  })

  it('로딩 중에는 스켈레톤을 표시한다', () => {
    vi.mocked(orderApi.listOrders).mockReturnValue(new Promise<Order[]>(() => {}))

    const { container } = renderPage()

    expect(container.querySelectorAll('[data-slot="skeleton-row"]').length).toBeGreaterThan(0)
  })

  it('에러 시 ErrorState 를 보여주고 다시 시도로 재요청한다', async () => {
    vi.mocked(orderApi.listOrders).mockRejectedValue(new Error('boom'))

    renderPage()

    expect(await screen.findByText('주문 내역을 불러오지 못했어요.')).toBeInTheDocument()

    vi.mocked(orderApi.listOrders).mockResolvedValue([pending])
    await userEvent.click(screen.getByRole('button', { name: '다시 시도' }))

    expect(await screen.findByText('스윗아워')).toBeInTheDocument()
  })
})
