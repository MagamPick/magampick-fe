import { describe, it, expect, vi, beforeEach } from 'vitest'
import { apiClient } from '@/shared/lib/axios'
import { productDetailApi } from './productDetailApi'

vi.mock('@/shared/lib/axios')

const makeRes = (data: unknown) => ({ data })

const baseProduct = {
  storeId: 1,
  storeName: '브레드샵',
  distanceKm: 0.3,
  businessStatus: 'OPEN',
  imageUrl: null,
  description: null,
  rating: 4.5,
  reviewCount: 10,
  closingTime: '21:00',
}

beforeEach(() => vi.clearAllMocks())

describe('productDetailApi', () => {
  it('menu_kind_올바른_엔드포인트_호출_그리고_number_id', async () => {
    vi.mocked(apiClient.get).mockResolvedValue(
      makeRes({
        ...baseProduct,
        kind: 'menu',
        id: 1,
        name: '소금빵',
        price: 3500,
        isOnSale: true,
      }),
    )
    const p = await productDetailApi.getProductDetail('menu', 1)
    expect(apiClient.get).toHaveBeenCalledWith('/products/1')
    expect(p.kind).toBe('menu')
    expect(p.id).toBe(1)
    expect(p.storeId).toBe(1)
    if (p.kind === 'menu') {
      expect(p.price).toBe(3500)
      expect(p.isOnSale).toBe(true)
    }
  })

  it('deal_kind_올바른_엔드포인트_호출_그리고_할인가_원가미만', async () => {
    vi.mocked(apiClient.get).mockResolvedValue(
      makeRes({
        ...baseProduct,
        kind: 'deal',
        id: 1,
        name: '크루아상 세트',
        originalPrice: 9000,
        salePrice: 4500,
        discountRate: 50,
        pickupDeadline: new Date(Date.now() + 30 * 60_000).toISOString(),
        stockLeft: 5,
        dealStatus: 'ACTIVE',
      }),
    )
    const p = await productDetailApi.getProductDetail('deal', 1)
    expect(apiClient.get).toHaveBeenCalledWith('/clearance-items/1')
    expect(p.kind).toBe('deal')
    if (p.kind === 'deal') {
      expect(p.salePrice).toBeLessThan(p.originalPrice)
      expect(p.dealStatus).toBe('ACTIVE')
      expect(p.stockLeft).toBeGreaterThan(0)
    }
  })

  it('deal_SOLD_OUT_EXPIRED_차단상태_파싱', async () => {
    vi.mocked(apiClient.get).mockResolvedValue(
      makeRes({
        ...baseProduct,
        kind: 'deal',
        id: 2,
        name: '마감상품',
        originalPrice: 8000,
        salePrice: 4000,
        discountRate: 50,
        pickupDeadline: new Date(Date.now() + 60_000).toISOString(),
        stockLeft: 0,
        dealStatus: 'SOLD_OUT',
      }),
    )
    const sold = await productDetailApi.getProductDetail('deal', 2)
    if (sold.kind === 'deal') expect(sold.dealStatus).toBe('SOLD_OUT')
  })

  it('menu_판매OFF_파싱', async () => {
    vi.mocked(apiClient.get).mockResolvedValue(
      makeRes({
        ...baseProduct,
        kind: 'menu',
        id: 3,
        name: '시즌 한정 타르트',
        price: 6800,
        isOnSale: false,
      }),
    )
    const off = await productDetailApi.getProductDetail('menu', 3)
    if (off.kind === 'menu') expect(off.isOnSale).toBe(false)
  })

  it('closingTime_null_허용', async () => {
    vi.mocked(apiClient.get).mockResolvedValue(
      makeRes({
        ...baseProduct,
        kind: 'menu',
        id: 4,
        name: '상품',
        closingTime: null,
        price: 3000,
        isOnSale: true,
      }),
    )
    const p = await productDetailApi.getProductDetail('menu', 4)
    expect(p.closingTime).toBeNull()
  })
})
