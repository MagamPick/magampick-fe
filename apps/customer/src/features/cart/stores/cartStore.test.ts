import { describe, it, expect, beforeEach } from 'vitest'
import { useCartStore, selectCartCount } from './cartStore'
import type { CartStoreInfo } from '../types'

const storeA: CartStoreInfo = { id: 'st-1', name: '브레드샵', closingTime: '20:00' }
const storeB: CartStoreInfo = { id: 'st-2', name: '카페하루', closingTime: '22:00' }

const dealItem = {
  id: 'd1',
  kind: 'deal' as const,
  name: '떨이 빵',
  imageUrl: null,
  originalPrice: 10000,
  salePrice: 6000,
}
const menuItem = {
  id: 'm1',
  kind: 'menu' as const,
  name: '일반 빵',
  imageUrl: null,
  originalPrice: 5000,
  salePrice: 5000,
}

const reset = () => useCartStore.setState({ store: null, items: [], pickup: { type: 'asap' } })

describe('cartStore', () => {
  beforeEach(reset)

  it('빈_장바구니에_담으면_매장과_항목_설정', () => {
    useCartStore.getState().addItem({ store: storeA, item: dealItem, qty: 2 })
    const s = useCartStore.getState()
    expect(s.store).toEqual(storeA)
    expect(s.items).toHaveLength(1)
    expect(s.items[0]).toMatchObject({ id: 'd1', qty: 2 })
  })

  it('같은_매장_같은_상품_재담기는_수량_병합_상한10', () => {
    const { addItem } = useCartStore.getState()
    addItem({ store: storeA, item: dealItem, qty: 7 })
    addItem({ store: storeA, item: dealItem, qty: 5 }) // 12 → 10
    const s = useCartStore.getState()
    expect(s.items).toHaveLength(1)
    expect(s.items[0].qty).toBe(10)
  })

  it('같은_매장_다른_상품은_추가', () => {
    const { addItem } = useCartStore.getState()
    addItem({ store: storeA, item: dealItem, qty: 1 })
    addItem({ store: storeA, item: menuItem, qty: 3 })
    expect(useCartStore.getState().items).toHaveLength(2)
  })

  it('담을때_수량_상한10_클램프', () => {
    useCartStore.getState().addItem({ store: storeA, item: dealItem, qty: 50 })
    expect(useCartStore.getState().items[0].qty).toBe(10)
  })

  it('다른_매장_담기면_기존_비우고_교체하고_픽업_초기화', () => {
    const { addItem, setPickup } = useCartStore.getState()
    addItem({ store: storeA, item: dealItem, qty: 2 })
    setPickup({ type: 'slot', time: '19:00' })
    addItem({ store: storeB, item: menuItem, qty: 1 })
    const s = useCartStore.getState()
    expect(s.store).toEqual(storeB)
    expect(s.items).toHaveLength(1)
    expect(s.items[0].id).toBe('m1')
    expect(s.pickup).toEqual({ type: 'asap' })
  })

  it('updateQty_는_1~10로_클램프', () => {
    const { addItem, updateQty } = useCartStore.getState()
    addItem({ store: storeA, item: dealItem, qty: 5 })
    updateQty('d1', 0)
    expect(useCartStore.getState().items[0].qty).toBe(1)
    updateQty('d1', 99)
    expect(useCartStore.getState().items[0].qty).toBe(10)
  })

  it('removeItem_마지막_삭제시_매장_null_픽업_초기화', () => {
    const { addItem, setPickup, removeItem } = useCartStore.getState()
    addItem({ store: storeA, item: dealItem, qty: 1 })
    addItem({ store: storeA, item: menuItem, qty: 1 })
    setPickup({ type: 'slot', time: '19:00' })
    removeItem('d1')
    expect(useCartStore.getState().items).toHaveLength(1)
    expect(useCartStore.getState().store).toEqual(storeA)
    removeItem('m1') // 마지막 항목
    const s = useCartStore.getState()
    expect(s.items).toHaveLength(0)
    expect(s.store).toBeNull()
    expect(s.pickup).toEqual({ type: 'asap' })
  })

  it('clearCart_전체_초기화', () => {
    const { addItem, clearCart } = useCartStore.getState()
    addItem({ store: storeA, item: dealItem, qty: 2 })
    clearCart()
    const s = useCartStore.getState()
    expect(s.items).toHaveLength(0)
    expect(s.store).toBeNull()
    expect(s.pickup).toEqual({ type: 'asap' })
  })

  it('selectCartCount_는_수량_합', () => {
    const { addItem } = useCartStore.getState()
    addItem({ store: storeA, item: dealItem, qty: 2 })
    addItem({ store: storeA, item: menuItem, qty: 3 })
    expect(selectCartCount(useCartStore.getState())).toBe(5)
  })
})
