import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { EmptyState } from './EmptyState'

describe('EmptyState', () => {
  it('아이콘과 메시지를 노출', () => {
    render(<EmptyState icon={<svg data-testid="icon" />}>주문이 없어요.</EmptyState>)
    expect(screen.getByTestId('icon')).toBeInTheDocument()
    expect(screen.getByText('주문이 없어요.')).toBeInTheDocument()
  })

  it('action 을 전달하면 CTA 를 노출', () => {
    render(
      <EmptyState icon={<svg data-testid="icon" />} action={<button type="button">상품 등록</button>}>
        등록된 상품이 없어요.
      </EmptyState>,
    )
    expect(screen.getByRole('button', { name: '상품 등록' })).toBeInTheDocument()
  })

  it('action 이 없으면 CTA 영역을 렌더하지 않음', () => {
    render(<EmptyState icon={<svg data-testid="icon" />}>등록된 상품이 없어요.</EmptyState>)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
