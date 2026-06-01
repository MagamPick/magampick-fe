import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CartSummary } from './CartSummary'
import type { CartItem } from '../types'

const items: CartItem[] = [
  { id: 'd1', kind: 'deal', name: '떨이', imageUrl: null, originalPrice: 10000, salePrice: 6000, qty: 2 }, // 정상 20000 / 할인 8000
  { id: 'm1', kind: 'menu', name: '일반', imageUrl: null, originalPrice: 5000, salePrice: 5000, qty: 1 }, // 정상 5000
]
// 정상 25000 / 할인 8000 / 결제 17000

describe('CartSummary', () => {
  it('상품금액_마감할인_결제예정_표시', () => {
    render(<CartSummary items={items} />)
    expect(screen.getByText('상품 금액').closest('div')).toHaveTextContent('25,000원')
    expect(screen.getByText('마감 할인').closest('div')).toHaveTextContent('-8,000원')
    expect(screen.getByText('결제 예정 금액').closest('div')).toHaveTextContent('17,000원')
  })

  it('할인이_없으면_마감할인_0원', () => {
    render(<CartSummary items={[items[1]]} />)
    expect(screen.getByText('마감 할인').closest('div')).toHaveTextContent('-0원')
  })
})
