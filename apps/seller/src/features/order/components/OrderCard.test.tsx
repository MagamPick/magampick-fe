import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { OrderCard } from './OrderCard'
import type { Order } from '../types'

const base: Order = {
  id: 'o1',
  storeId: 's1',
  orderNo: '1024',
  customerName: '빵순이',
  customerPhone: '010-2847-3920',
  placedAt: '2026-06-01T04:40:00.000Z',
  pickupTime: '14:30',
  pickupCode: '4827',
  status: 'PENDING',
  items: [
    { name: '버터 크루아상', quantity: 1, price: 3000 },
    { name: '플레인 베이글', quantity: 1, price: 2800 },
    { name: '소금빵', quantity: 1, price: 2600 },
  ],
  total: 8400,
  paymentMethod: '토스페이',
}

describe('OrderCard', () => {
  it('픽업 시간·상태 배지·상품 요약·결제 금액·고객명을 표시한다', () => {
    render(<OrderCard order={base} />)
    expect(screen.getByText('픽업 14:30')).toBeInTheDocument()
    expect(screen.getByText('신규 주문')).toBeInTheDocument()
    expect(screen.getByText('버터 크루아상 외 2건')).toBeInTheDocument()
    expect(screen.getByText('8,400원')).toBeInTheDocument()
    expect(screen.getByText('빵순이님')).toBeInTheDocument()
  })

  it('단일 상품은 "이름 수량개" 로 요약한다', () => {
    render(
      <OrderCard
        order={{ ...base, items: [{ name: '치아바타', quantity: 2, price: 3500 }], total: 7000 }}
      />,
    )
    expect(screen.getByText('치아바타 2개')).toBeInTheDocument()
  })

  it('ASAP 픽업은 "픽업 가능한 빨리" 로 표시한다', () => {
    render(<OrderCard order={{ ...base, pickupTime: 'ASAP' }} />)
    expect(screen.getByText('픽업 가능한 빨리')).toBeInTheDocument()
  })

  it('취소·환불 주문은 환불 금액과 결제수단을 표시한다 (고객명 대신)', () => {
    render(<OrderCard order={{ ...base, status: 'REJECTED' }} />)
    expect(screen.getByText('매장 거절')).toBeInTheDocument()
    expect(screen.getByText('환불')).toBeInTheDocument()
    expect(screen.getByText('토스페이')).toBeInTheDocument()
    expect(screen.queryByText('빵순이님')).not.toBeInTheDocument()
  })

  it('카드 본문을 누르면 onSelect 가 호출된다', async () => {
    const onSelect = vi.fn()
    render(<OrderCard order={base} onSelect={onSelect} />)
    await userEvent.click(screen.getByText('버터 크루아상 외 2건'))
    expect(onSelect).toHaveBeenCalledTimes(1)
  })

  it('actions 슬롯의 버튼을 렌더한다', () => {
    render(<OrderCard order={base} actions={<button type="button">수락</button>} />)
    expect(screen.getByRole('button', { name: '수락' })).toBeInTheDocument()
  })
})
