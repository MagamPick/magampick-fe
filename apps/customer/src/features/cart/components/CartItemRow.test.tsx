import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CartItemRow } from './CartItemRow'
import { useCartStore } from '../stores/cartStore'
import type { CartItem } from '../types'

const deal: CartItem = {
  id: 'd1',
  kind: 'deal',
  name: '크루아상 세트',
  imageUrl: null,
  originalPrice: 10000,
  salePrice: 6000,
  qty: 3,
}
const menu: CartItem = {
  id: 'm1',
  kind: 'menu',
  name: '아메리카노',
  imageUrl: null,
  originalPrice: 4000,
  salePrice: 4000,
  qty: 1,
}

const setItems = (items: CartItem[]) =>
  useCartStore.setState({
    store: { id: 'st-1', name: '브레드샵', closingTime: '20:00' },
    items,
    pickup: { type: 'asap' },
  })

describe('CartItemRow', () => {
  beforeEach(() => setItems([deal]))

  it('떨이는_할인율_원가취소선_할인가_표시', () => {
    render(<CartItemRow item={deal} />)
    expect(screen.getByText('40%')).toBeInTheDocument()
    expect(screen.getByText('10,000원')).toBeInTheDocument()
    expect(screen.getByText('6,000원')).toBeInTheDocument()
  })

  it('일반상품은_정가만_표시', () => {
    render(<CartItemRow item={menu} />)
    expect(screen.getByText('4,000원')).toBeInTheDocument()
    expect(screen.queryByText(/%/)).not.toBeInTheDocument()
  })

  it('수량_감소는_하한1에서_비활성', () => {
    setItems([{ ...deal, qty: 1 }])
    render(<CartItemRow item={useCartStore.getState().items[0]} />)
    expect(screen.getByLabelText('수량 감소')).toBeDisabled()
  })

  it('수량_증가가_스토어에_반영', async () => {
    setItems([{ ...deal, qty: 1 }])
    const user = userEvent.setup()
    render(<CartItemRow item={useCartStore.getState().items[0]} />)
    await user.click(screen.getByLabelText('수량 증가'))
    expect(useCartStore.getState().items[0].qty).toBe(2)
  })

  it('수량_상한10에서_증가_비활성', () => {
    setItems([{ ...deal, qty: 10 }])
    render(<CartItemRow item={useCartStore.getState().items[0]} />)
    expect(screen.getByLabelText('수량 증가')).toBeDisabled()
  })

  it('삭제_버튼이_스토어에서_항목_제거', async () => {
    setItems([deal, menu])
    const user = userEvent.setup()
    render(<CartItemRow item={deal} />)
    await user.click(screen.getByLabelText('삭제'))
    expect(useCartStore.getState().items.find((i) => i.id === 'd1')).toBeUndefined()
  })
})
