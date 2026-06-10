import { describe, it, expect } from 'vitest'
import { getPurchaseState } from './purchasable'
import type { DealProductDetail, MenuProductDetail } from '../types'

const NOW = Date.parse('2026-05-31T12:00:00.000Z')

const baseMenu: MenuProductDetail = {
  kind: 'menu',
  id: 1,
  storeId: 1,
  storeName: '브레드샵',
  distanceKm: 0.3,
  businessStatus: 'OPEN',
  imageUrl: null,
  name: '소금빵',
  description: null,
  rating: 4.5,
  reviewCount: 10,
  closingTime: '21:00',
  price: 3000,
  isOnSale: true,
}

const baseDeal: DealProductDetail = {
  kind: 'deal',
  id: 1,
  storeId: 1,
  storeName: '브레드샵',
  distanceKm: 0.3,
  businessStatus: 'OPEN',
  imageUrl: null,
  name: '크루아상 세트',
  description: null,
  rating: 4.8,
  reviewCount: 412,
  closingTime: '21:00',
  originalPrice: 9000,
  salePrice: 4500,
  discountRate: 50,
  pickupDeadline: new Date(NOW + 30 * 60_000).toISOString(),
  stockLeft: 5,
  dealStatus: 'ACTIVE',
}

describe('getPurchaseState', () => {
  it('정상_일반상품_구매가능', () => {
    expect(getPurchaseState(baseMenu, NOW)).toEqual({ purchasable: true })
  })

  it('정상_떨이_구매가능', () => {
    expect(getPurchaseState(baseDeal, NOW)).toEqual({ purchasable: true })
  })

  it('매장_영업외_차단', () => {
    expect(getPurchaseState({ ...baseMenu, businessStatus: 'BREAK' }, NOW)).toEqual({
      purchasable: false,
      reason: '지금은 주문할 수 없는 매장이에요.',
    })
  })

  it('매장_영업외가_떨이마감보다_우선', () => {
    expect(
      getPurchaseState(
        { ...baseDeal, businessStatus: 'CLOSED_TODAY', dealStatus: 'SOLD_OUT' },
        NOW,
      ),
    ).toEqual({ purchasable: false, reason: '지금은 주문할 수 없는 매장이에요.' })
  })

  it('일반상품_판매OFF_차단', () => {
    expect(getPurchaseState({ ...baseMenu, isOnSale: false }, NOW)).toEqual({
      purchasable: false,
      reason: '현재 판매하지 않는 상품이에요.',
    })
  })

  it('떨이_상태마감_차단', () => {
    for (const dealStatus of ['SOLD_OUT', 'EXPIRED', 'MANUAL'] as const) {
      expect(getPurchaseState({ ...baseDeal, dealStatus }, NOW)).toEqual({
        purchasable: false,
        reason: '마감된 상품이에요.',
      })
    }
  })

  it('떨이_픽업마감_시각경과_차단', () => {
    expect(
      getPurchaseState({ ...baseDeal, pickupDeadline: new Date(NOW - 1000).toISOString() }, NOW),
    ).toEqual({ purchasable: false, reason: '마감된 상품이에요.' })
  })

  it('떨이_재고0_차단', () => {
    expect(getPurchaseState({ ...baseDeal, stockLeft: 0 }, NOW)).toEqual({
      purchasable: false,
      reason: '마감된 상품이에요.',
    })
  })
})
