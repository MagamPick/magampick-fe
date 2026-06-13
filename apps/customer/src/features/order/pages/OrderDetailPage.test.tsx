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

  it('혜택(쿠폰·포인트) 적용 주문이면 결제 금액을 실청구액(finalAmount)으로 표시한다 (A4-2)', async () => {
    // 상품 11,500 - 마감할인 1,600 = payTotal 9,900 - 쿠폰 2,000 - 포인트 500 = finalAmount 7,400
    renderPage({
      ...base,
      amounts: {
        normalTotal: 11500,
        discountTotal: 1600,
        payTotal: 9900,
        couponDiscount: 2000,
        pointUsed: 500,
        finalAmount: 7400,
      },
    })
    // 쿠폰·포인트 차감 줄이 보이고
    expect(await screen.findByText('쿠폰 할인')).toBeInTheDocument()
    expect(screen.getByText('-2,000원')).toBeInTheDocument()
    expect(screen.getByText('포인트 사용')).toBeInTheDocument()
    expect(screen.getByText('-500원')).toBeInTheDocument()
    // 결제 금액 = finalAmount(7,400원) — payTotal(9,900원)이 아니어야 합이 맞는다
    expect(screen.getByText('7,400원')).toBeInTheDocument()
    expect(screen.queryByText('9,900원')).not.toBeInTheDocument()
  })

  it('혜택 없는 주문이면 쿠폰·포인트 줄 없이 결제 금액 = 상품-마감할인 (하위호환)', async () => {
    // base: 상품 4,000 - 마감할인 800 = payTotal 3,200, finalAmount 미지정
    renderPage(base)
    expect(await screen.findByText('상품 금액')).toBeInTheDocument()
    expect(screen.queryByText('쿠폰 할인')).not.toBeInTheDocument()
    expect(screen.queryByText('포인트 사용')).not.toBeInTheDocument()
    // 결제 금액 = finalAmount ?? payTotal = 3,200원 (상품/결제금액 줄에 등장)
    expect(screen.getAllByText('3,200원').length).toBeGreaterThanOrEqual(1)
  })
})
