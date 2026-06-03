import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router'
import { OrderDetailPage } from './OrderDetailPage'
import { orderApi } from '../api/orderApi'
import { createQueryWrapper } from '@/shared/test/queryWrapper'
import type { Order } from '../types'

vi.mock('../api/orderApi')

const base: Order = {
  id: 'o1',
  orderNo: '1001',
  storeId: 'st1',
  storeName: '베이커리',
  storePhone: '02-1234-5678',
  items: [
    {
      id: 'i1',
      kind: 'deal',
      name: '크루아상',
      imageUrl: null,
      originalPrice: 4000,
      salePrice: 3200,
      qty: 1,
    },
  ],
  pickup: { type: 'slot', time: '18:30' },
  memo: '덜 구워주세요',
  amounts: { normalTotal: 4000, discountTotal: 800, payTotal: 3200 },
  pickupCode: '4728',
  status: 'PENDING',
  paymentMethod: 'toss',
  createdAt: new Date().toISOString(),
}

function renderPage(order: Order) {
  const wrapper = createQueryWrapper()
  vi.mocked(orderApi.getOrder).mockResolvedValue(order)
  return render(
    <MemoryRouter initialEntries={[`/orders/${order.id}`]}>
      <Routes>
        <Route path="/orders/:id" element={<OrderDetailPage />} />
      </Routes>
    </MemoryRouter>,
    { wrapper },
  )
}

describe('OrderDetailPage', () => {
  beforeEach(() => vi.clearAllMocks())

  it('PENDING 상태면 주문 취소와 매장 전화 CTA를 표시한다', async () => {
    renderPage(base)
    expect(await screen.findByRole('button', { name: /주문 취소/ })).toBeInTheDocument()
    const callLinks = screen.getAllByRole('link', { name: /전화/ })
    expect(callLinks.length).toBeGreaterThanOrEqual(1)
  })

  it('READY 상태면 픽업코드가 강조 표시된다', async () => {
    renderPage({ ...base, status: 'READY' })
    expect(await screen.findByText('4728')).toBeInTheDocument()
    expect(screen.getByText(/매장에 보여주세요/)).toBeInTheDocument()
  })

  it('COMPLETED 상태면 리뷰 작성과 재주문 CTA를 표시한다', async () => {
    renderPage({ ...base, status: 'COMPLETED' })
    expect(await screen.findByRole('button', { name: /리뷰 작성/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /재주문/ })).toBeInTheDocument()
  })

  it('PENDING 상태에서 주문 취소 버튼 클릭 시 확인 시트를 연다', async () => {
    renderPage(base)
    const cancelBtn = await screen.findByRole('button', { name: /주문 취소/ })
    await userEvent.click(cancelBtn)
    expect(screen.getByText('주문을 취소할까요?')).toBeInTheDocument()
  })
})
