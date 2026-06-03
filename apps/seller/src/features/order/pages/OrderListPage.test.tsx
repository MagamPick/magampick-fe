import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route, useParams } from 'react-router'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../hooks/useOrders')
vi.mock('../hooks/useOrderActions')
import { useOrders } from '../hooks/useOrders'
import { useOrderActions } from '../hooks/useOrderActions'
import { OrderListPage } from './OrderListPage'
import type { Order, OrderStatus } from '../types'

function makeOrder(id: string, status: OrderStatus, customerName: string, items: Order['items']): Order {
  return {
    id,
    storeId: 's1',
    orderNo: id.replace('o', '10'),
    customerName,
    customerPhone: '010-0000-0000',
    placedAt: '2026-06-01T04:00:00.000Z',
    pickupTime: '14:30',
    pickupCode: '4827',
    status,
    items,
    total: items.reduce((s, it) => s + it.price * it.quantity, 0),
    paymentMethod: '토스페이',
  }
}

const ORDERS: Order[] = [
  makeOrder('o1', 'PENDING', '빵순이', [
    { name: '버터 크루아상', quantity: 1, price: 3000 },
    { name: '플레인 베이글', quantity: 1, price: 2800 },
    { name: '소금빵', quantity: 1, price: 2600 },
  ]),
  makeOrder('o2', 'PENDING', '단골손님', [{ name: '우유 식빵', quantity: 1, price: 2750 }]),
  makeOrder('o4', 'PREPARING', '빵빵', [{ name: '치아바타', quantity: 2, price: 3500 }]),
  makeOrder('o6', 'READY', '모닝콜', [{ name: '플레인 베이글', quantity: 1, price: 2800 }]),
  makeOrder('o7', 'COMPLETED', '해피', [{ name: '스콘', quantity: 2, price: 2000 }]),
  makeOrder('o9', 'REJECTED', '새벽이', [{ name: '우유 식빵', quantity: 1, price: 2750 }]),
]

const accept = vi.fn()
const reject = vi.fn()
const ready = vi.fn()
const complete = vi.fn()

function mockOrders(data: Order[] | undefined, isLoading = false) {
  vi.mocked(useOrders).mockReturnValue({ data, isLoading } as unknown as ReturnType<typeof useOrders>)
}

function DetailProbe() {
  const { id } = useParams()
  return <div>상세화면 {id}</div>
}

function renderPage(initial = '/orders') {
  return render(
    <MemoryRouter initialEntries={[initial]}>
      <Routes>
        <Route path="/orders" element={<OrderListPage />} />
        <Route path="/orders/:id" element={<DetailProbe />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('OrderListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useOrderActions).mockReturnValue({
      accept: { mutate: accept, isPending: false },
      reject: { mutate: reject, isPending: false },
      ready: { mutate: ready, isPending: false },
      complete: { mutate: complete, isPending: false },
      noShow: { mutate: vi.fn(), isPending: false },
    } as unknown as ReturnType<typeof useOrderActions>)
    mockOrders(ORDERS)
  })

  it('화면 셸 배경은 흰색(bg-card)을 유지한다', () => {
    const { container } = renderPage()
    expect(container.firstElementChild).toHaveClass('bg-card')
    expect(container.firstElementChild).not.toHaveClass('bg-background')
  })

  it('신규·준비중 세그먼트에 건수 뱃지를 표시한다', () => {
    renderPage()
    expect(within(screen.getByRole('tab', { name: /신규/ })).getByText('2')).toBeInTheDocument()
    expect(within(screen.getByRole('tab', { name: /준비중/ })).getByText('1')).toBeInTheDocument()
  })

  it('기본은 신규 세그먼트의 주문만 보여준다', () => {
    renderPage()
    expect(screen.getByText('버터 크루아상 외 2건')).toBeInTheDocument()
    expect(screen.getByText('우유 식빵 1개')).toBeInTheDocument()
    expect(screen.queryByText('치아바타 2개')).not.toBeInTheDocument()
  })

  it('준비중 탭으로 전환하면 준비중 주문을 보여준다', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('tab', { name: /준비중/ }))
    expect(screen.getByText('치아바타 2개')).toBeInTheDocument()
    expect(screen.queryByText('버터 크루아상 외 2건')).not.toBeInTheDocument()
  })

  it('취소·환불 탭은 매장 거절 주문을 보여준다', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('tab', { name: /취소·환불/ }))
    expect(screen.getByText('매장 거절')).toBeInTheDocument()
  })

  it('신규 카드의 [수락]을 누르면 해당 주문을 수락한다', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getAllByRole('button', { name: '수락' })[0])
    expect(accept).toHaveBeenCalledWith('o1')
  })

  it('신규 카드의 [거절]은 확인 시트를 거쳐 거절한다', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getAllByRole('button', { name: '거절' })[0])
    // 확인 시트
    expect(screen.getByText('주문을 거절할까요?')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '주문 거절' }))
    expect(reject).toHaveBeenCalledWith('o1', expect.anything())
  })

  it('준비완료 탭의 [수령 완료 처리]로 픽업을 완료한다', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('tab', { name: /준비완료/ }))
    await user.click(screen.getByRole('button', { name: '수령 완료 처리' }))
    expect(complete).toHaveBeenCalledWith('o6')
  })

  it('검색으로 고객명을 필터링한다', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('button', { name: '주문 검색' }))
    await user.type(screen.getByPlaceholderText('주문번호 또는 고객명 검색'), '단골')
    expect(screen.getByText('우유 식빵 1개')).toBeInTheDocument()
    expect(screen.queryByText('버터 크루아상 외 2건')).not.toBeInTheDocument()
  })

  it('카드 본문을 누르면 주문 상세로 이동한다', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByText('버터 크루아상 외 2건'))
    expect(screen.getByText('상세화면 o1')).toBeInTheDocument()
  })

  // --- 비동기 상태 분기 (스켈레톤 / 에러 / 빈) ---
  function mockOrdersState(over: Record<string, unknown>) {
    vi.mocked(useOrders).mockReturnValue({
      data: undefined,
      isPending: false,
      isError: false,
      refetch: vi.fn(),
      ...over,
    } as unknown as ReturnType<typeof useOrders>)
  }

  it('로딩 중이면 스켈레톤을 노출한다', () => {
    mockOrdersState({ isPending: true })
    const { container } = renderPage()
    expect(container.querySelectorAll('[data-slot="skeleton-row"]').length).toBeGreaterThan(0)
  })

  it('에러면 ErrorState 와 다시 시도(refetch)를 노출한다', async () => {
    const refetch = vi.fn()
    mockOrdersState({ isError: true, refetch })
    renderPage()
    expect(screen.getByText('주문 목록을 불러오지 못했어요.')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: '다시 시도' }))
    expect(refetch).toHaveBeenCalled()
  })

  it('신규 주문이 0건이면 EmptyState 를 노출한다', () => {
    mockOrdersState({ data: [] })
    renderPage()
    expect(screen.getByText('새로 들어온 주문이 없어요.')).toBeInTheDocument()
  })
})
