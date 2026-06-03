import { describe, it, expect } from 'vitest'
import { productDetailApi } from './productDetailApi'

describe('productDetailApi (mock)', () => {
  it('떨이_fixture_분기필드_보유_할인가_원가미만_미래마감_재고', async () => {
    const p = await productDetailApi.getProductDetail('deal', 'sd-1')
    expect(p.kind).toBe('deal')
    if (p.kind !== 'deal') throw new Error('deal 기대')
    expect(p.salePrice).toBeLessThan(p.originalPrice)
    expect(new Date(p.pickupDeadline).getTime()).toBeGreaterThan(Date.now() - 1000)
    expect(p.stockLeft).toBeGreaterThan(0)
    expect(p.dealStatus).toBe('ACTIVE')
    expect(p.storeName.length).toBeGreaterThan(0)
    expect(p.storeId.length).toBeGreaterThan(0)
  })

  it('일반_fixture_정가_판매여부_보유', async () => {
    const p = await productDetailApi.getProductDetail('menu', 'mn-1')
    expect(p.kind).toBe('menu')
    if (p.kind !== 'menu') throw new Error('menu 기대')
    expect(p.price).toBeGreaterThan(0)
    expect(p.isOnSale).toBe(true)
  })

  it('차단상태_fixture_SOLD_OUT_EXPIRED_판매OFF', async () => {
    const sold = await productDetailApi.getProductDetail('deal', 'sd-sold')
    if (sold.kind !== 'deal') throw new Error('deal 기대')
    expect(sold.dealStatus).toBe('SOLD_OUT')

    const expired = await productDetailApi.getProductDetail('deal', 'sd-expired')
    if (expired.kind !== 'deal') throw new Error('deal 기대')
    expect(new Date(expired.pickupDeadline).getTime()).toBeLessThan(Date.now())

    const off = await productDetailApi.getProductDetail('menu', 'mn-off')
    if (off.kind !== 'menu') throw new Error('menu 기대')
    expect(off.isOnSale).toBe(false)
  })

  it('알수없는_id도_kind에_맞는_상품_반환_id보존', async () => {
    const d = await productDetailApi.getProductDetail('deal', 'cd-xyz')
    expect(d.kind).toBe('deal')
    expect(d.id).toBe('cd-xyz')
    expect(d.name.length).toBeGreaterThan(0)
    if (d.kind === 'deal') expect(d.salePrice).toBeLessThan(d.originalPrice)

    const m = await productDetailApi.getProductDetail('menu', 'unknown-1')
    expect(m.kind).toBe('menu')
    expect(m.id).toBe('unknown-1')
    if (m.kind === 'menu') expect(m.price).toBeGreaterThan(0)
  })
})
