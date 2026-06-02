import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { RefundRequestCard } from './RefundRequestCard'
import type { RefundRequest } from '../types'

const base: RefundRequest = {
  id: 'rf1',
  orderId: 'o1',
  orderNo: '1019',
  storeId: 's1',
  customerName: '빵순이',
  items: [{ name: '버터 크루아상', quantity: 2, price: 3000 }],
  amount: 6000,
  pickupCompletedAt: '2026-05-31T00:00:00.000Z',
  status: 'REQUESTED',
  reason: '빵에서 상한 냄새가 나요.',
  requestedAt: new Date().toISOString(),
}

describe('RefundRequestCard', () => {
  it('주문번호·고객·환불액·사유·상태를 표시한다', () => {
    render(<RefundRequestCard refund={base} />)
    expect(screen.getByText('#1019')).toBeInTheDocument()
    expect(screen.getByText(/빵순이/)).toBeInTheDocument()
    expect(screen.getByText(/6,000원/)).toBeInTheDocument()
    expect(screen.getByText(/상한 냄새/)).toBeInTheDocument()
    expect(screen.getByText('승인 대기')).toBeInTheDocument()
  })

  it('대기중이면 자동 승인 기한 안내와 인라인 액션을 보여준다', () => {
    render(<RefundRequestCard refund={base} actions={<button type="button">승인</button>} />)
    expect(screen.getByText(/자동 승인/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '승인' })).toBeInTheDocument()
  })

  it('거부됨이면 거부 사유를 표시한다', () => {
    render(
      <RefundRequestCard
        refund={{ ...base, status: 'REJECTED', rejectReason: '정상 수령하신 상품이에요' }}
      />,
    )
    expect(screen.getByText('거부됨')).toBeInTheDocument()
    expect(screen.getByText(/거부 사유: 정상 수령하신 상품이에요/)).toBeInTheDocument()
  })
})
