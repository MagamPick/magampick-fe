import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../hooks/useOrder')
vi.mock('../hooks/useOrderActions')
import { useOrder } from '../hooks/useOrder'
import { useOrderActions } from '../hooks/useOrderActions'
import { OrderDetailPage } from './OrderDetailPage'
import type { Order, OrderStatus } from '../types'

const base: Order = {
  id: 'o1',
  storeId: 's1',
  orderNo: '1024',
  customerName: '빵순이',
  customerPhone: '010-2847-3920',
  placedAt: '2026-06-01T04:05:00.000Z',
  pickupTime: '14:30',
  pickupCode: '4827',
  status: 'PENDING',
  memo: '덜 익은 빵으로 부탁드려요.',
  items: [
    { name: '버터 크루아상', quantity: 1, price: 3000 },
    { name: '소금빵', quantity: 2, price: 2600 },
  ],
  total: 8200,
  paymentMethod: '토스페이',
}

const accept = vi.fn()
const reject = vi.fn()
const ready = vi.fn()
const complete = vi.fn()
const noShow = vi.fn()

function mockOrder(order: Order) {
  vi.mocked(useOrder).mockReturnValue({
    data: order,
    isLoading: false,
    isError: false,
  } as unknown as ReturnType<typeof useOrder>)
}

function renderDetail() {
  return render(
    <MemoryRouter initialEntries={['/orders/o1']}>
      <Routes>
        <Route path="/orders/:id" element={<OrderDetailPage />} />
        <Route path="/orders" element={<div>주문 목록</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

function withStatus(status: OrderStatus, extra: Partial<Order> = {}) {
  mockOrder({ ...base, status, ...extra })
}

describe('OrderDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useOrderActions).mockReturnValue({
      accept: { mutate: accept, isPending: false },
      reject: { mutate: reject, isPending: false },
      ready: { mutate: ready, isPending: false },
      complete: { mutate: complete, isPending: false },
      noShow: { mutate: noShow, isPending: false },
    } as unknown as ReturnType<typeof useOrderActions>)
  })

  it('주문번호·상품·금액·고객 정보·메모를 표시한다', () => {
    withStatus('PENDING')
    renderDetail()
    expect(screen.getByText(/#1024/)).toBeInTheDocument()
    expect(screen.getByText('버터 크루아상')).toBeInTheDocument()
    expect(screen.getByText('8,200원')).toBeInTheDocument()
    expect(screen.getByText('빵순이님')).toBeInTheDocument()
    expect(screen.getByText('010-2847-3920')).toBeInTheDocument()
    expect(screen.getByText(/덜 익은 빵으로/)).toBeInTheDocument()
  })

  it('전화 버튼은 tel: 링크를 가진다', () => {
    withStatus('PENDING')
    renderDetail()
    expect(screen.getByRole('link', { name: /전화/ })).toHaveAttribute('href', 'tel:01028473920')
  })

  it('신규(PENDING): 수락 버튼으로 수락한다', async () => {
    const user = userEvent.setup()
    withStatus('PENDING')
    renderDetail()
    await user.click(screen.getByRole('button', { name: '주문 수락' }))
    expect(accept).toHaveBeenCalledWith('o1')
  })

  it('신규(PENDING): 거절은 확인 시트를 거쳐 거절한다', async () => {
    const user = userEvent.setup()
    withStatus('PENDING')
    renderDetail()
    await user.click(screen.getByRole('button', { name: '거절' }))
    expect(screen.getByText('주문을 거절할까요?')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '주문 거절' }))
    expect(reject).toHaveBeenCalledWith('o1', expect.anything())
  })

  it('준비중(PREPARING): 준비 완료로 변경한다', async () => {
    const user = userEvent.setup()
    withStatus('PREPARING')
    renderDetail()
    await user.click(screen.getByRole('button', { name: '준비 완료로 변경' }))
    expect(ready).toHaveBeenCalledWith('o1')
  })

  it('준비완료(READY): 픽업 코드가 강조되고 수령 완료/미수령 CTA가 있다', async () => {
    const user = userEvent.setup()
    withStatus('READY')
    renderDetail()
    expect(screen.getByText('4827')).toBeInTheDocument()
    expect(screen.getByText(/이 코드를 확인하고 픽업을 완료/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '수령 완료 처리' }))
    expect(complete).toHaveBeenCalledWith('o1')
  })

  it('준비완료(READY): 미수령은 확인 시트를 거쳐 처리한다', async () => {
    const user = userEvent.setup()
    withStatus('READY')
    renderDetail()
    await user.click(screen.getByRole('button', { name: '미수령' }))
    expect(screen.getByText('미수령 처리할까요?')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '미수령 처리' }))
    expect(noShow).toHaveBeenCalledWith('o1', expect.anything())
  })

  it('픽업 완료(COMPLETED): 액션 버튼 없이 안내만 표시한다', () => {
    withStatus('COMPLETED')
    renderDetail()
    expect(screen.getByText(/픽업이 완료된 주문/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '주문 수락' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '수령 완료 처리' })).not.toBeInTheDocument()
  })

  it('메모가 없으면 표시하지 않는다', () => {
    withStatus('PENDING', { memo: undefined })
    renderDetail()
    expect(screen.queryByText(/덜 익은 빵으로/)).not.toBeInTheDocument()
  })
})
