import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { EmptyState } from './EmptyState'

describe('EmptyState', () => {
  it('아이콘과 메시지를 노출', () => {
    render(<EmptyState icon="🧾">주문 내역이 없어요.</EmptyState>)
    expect(screen.getByText('🧾')).toBeInTheDocument()
    expect(screen.getByText('주문 내역이 없어요.')).toBeInTheDocument()
  })

  it('action 을 전달하면 CTA 를 노출', () => {
    render(
      <EmptyState icon="🎟" action={<button type="button">쿠폰 받으러 가기</button>}>
        보유한 쿠폰이 없어요.
      </EmptyState>,
    )
    expect(screen.getByRole('button', { name: '쿠폰 받으러 가기' })).toBeInTheDocument()
  })

  it('action 이 없으면 CTA 영역을 렌더하지 않음', () => {
    render(<EmptyState icon="🎟">보유한 쿠폰이 없어요.</EmptyState>)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
