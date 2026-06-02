import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { OrdersPanel } from './OrdersPanel'
import type { OrderMetrics } from '../types'

describe('OrdersPanel', () => {
  it('주문 건수와 픽업 완료율(파생)을 보여준다', () => {
    const orders: OrderMetrics = { total: 32, pickedUp: 30, canceled: 1, noShow: 1 }
    render(<OrdersPanel orders={orders} />)
    expect(screen.getByText('총 주문')).toBeInTheDocument()
    expect(screen.getByText('32건')).toBeInTheDocument()
    expect(screen.getByText('미수령(노쇼)')).toBeInTheDocument()
    expect(screen.getByText('픽업 완료율')).toBeInTheDocument()
    expect(screen.getByText('94%')).toBeInTheDocument() // 30/32 = 93.75 → 94
  })
})
