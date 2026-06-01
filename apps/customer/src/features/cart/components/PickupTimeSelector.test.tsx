import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PickupTimeSelector } from './PickupTimeSelector'
import { useCartStore } from '../stores/cartStore'

/** 로컬 시각 기준 nowMs */
const at = (h: number, m: number) => new Date(2026, 5, 1, h, m, 0, 0).getTime()

beforeEach(() =>
  useCartStore.setState({
    store: { id: 'st-1', name: '브레드샵', closingTime: '20:00' },
    items: [
      { id: 'd1', kind: 'deal', name: 'x', imageUrl: null, originalPrice: 1000, salePrice: 800, qty: 1 },
    ],
    pickup: { type: 'asap' },
  }),
)

describe('PickupTimeSelector', () => {
  it('기본은_가능한_빨리_선택', () => {
    render(<PickupTimeSelector nowMs={at(18, 0)} />)
    expect(screen.getByRole('button', { name: '가능한 빨리' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('마감_전_15분_슬롯_칩_노출', () => {
    render(<PickupTimeSelector nowMs={at(18, 0)} />)
    expect(screen.getByRole('button', { name: '18:15' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '20:00' })).toBeInTheDocument()
  })

  it('슬롯_칩_클릭시_픽업_변경', async () => {
    const user = userEvent.setup()
    render(<PickupTimeSelector nowMs={at(18, 0)} />)
    await user.click(screen.getByRole('button', { name: '18:15' }))
    expect(useCartStore.getState().pickup).toEqual({ type: 'slot', time: '18:15' })
    expect(screen.getByRole('button', { name: '18:15' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('매장_없으면_렌더_안함', () => {
    useCartStore.setState({ store: null, items: [], pickup: { type: 'asap' } })
    const { container } = render(<PickupTimeSelector nowMs={at(18, 0)} />)
    expect(container).toBeEmptyDOMElement()
  })
})
