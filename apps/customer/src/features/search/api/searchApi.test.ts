import { describe, it, expect, vi, beforeEach } from 'vitest'
import { searchApi } from './searchApi'

vi.mock('@/shared/lib/axios', () => ({
  apiClient: {
    get: vi.fn(),
  },
}))

import { apiClient } from '@/shared/lib/axios'

/** BE StoreListItemResponse 픽스처 */
const storePayload = {
  id: 101,
  name: '베이커리 브레드샵',
  imageUrl: null,
  distanceKm: 0.3,
  rating: 4.6,
  activeDealCount: 2,
  isFavorite: false,
}

/** BE DealSearchItem 픽스처 */
const dealPayload = {
  kind: 'deal',
  id: 1001,
  storeId: 101,
  storeName: '베이커리 브레드샵',
  name: '크루아상',
  imageUrl: 'https://cdn.example.com/croissant.jpg',
  originalPrice: 4000,
  salePrice: 2400,
  discountRate: 40,
}

/** BE MenuSearchItem 픽스처 */
const menuPayload = {
  kind: 'menu',
  id: 2001,
  storeId: 102,
  storeName: '카페 모리',
  name: '아메리카노',
  imageUrl: null,
  price: 4000,
}

beforeEach(() => {
  vi.mocked(apiClient.get).mockResolvedValue({
    data: { stores: [storePayload], products: [dealPayload, menuPayload] },
  })
})

describe('searchApi.search (키워드 검색)', () => {
  it('올바른_엔드포인트와_파라미터로_요청', async () => {
    await searchApi.search({ q: '크루아상', sort: 'recommended' })

    expect(apiClient.get).toHaveBeenCalledWith('/search', {
      params: { q: '크루아상', sort: 'recommended' },
    })
  })

  it('정렬_파라미터가_올바르게_전달', async () => {
    await searchApi.search({ q: '빵', sort: 'distance' })

    expect(apiClient.get).toHaveBeenCalledWith('/search', {
      params: { q: '빵', sort: 'distance' },
    })
  })

  it('BE_payload를_Zod_파싱하여_반환', async () => {
    const result = await searchApi.search({ q: '크루아상', sort: 'recommended' })

    expect(result.stores).toHaveLength(1)
    expect(result.products).toHaveLength(2)
  })

  it('deal_kind_판별_및_id가_number', async () => {
    const result = await searchApi.search({ q: '크루아상', sort: 'recommended' })
    const deal = result.products.find((p) => p.kind === 'deal')

    expect(deal).toBeDefined()
    expect(deal!.kind).toBe('deal')
    expect(typeof deal!.id).toBe('number')
    expect(deal!.id).toBe(1001)
  })

  it('menu_kind_판별_및_id가_number', async () => {
    const result = await searchApi.search({ q: '크루아상', sort: 'recommended' })
    const menu = result.products.find((p) => p.kind === 'menu')

    expect(menu).toBeDefined()
    expect(menu!.kind).toBe('menu')
    expect(typeof menu!.id).toBe('number')
    expect(menu!.id).toBe(2001)
  })

  it('storeId가_number', async () => {
    const result = await searchApi.search({ q: '크루아상', sort: 'recommended' })
    const deal = result.products.find((p) => p.kind === 'deal')

    expect(typeof deal!.storeId).toBe('number')
    expect(deal!.storeId).toBe(101)
  })

  it('imageUrl_키_생략_시_null로_변환', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        stores: [],
        products: [
          {
            kind: 'deal',
            id: 999,
            storeId: 1,
            originalPrice: 1000,
            salePrice: 800,
            discountRate: 20,
          },
        ],
      },
    })

    const result = await searchApi.search({ q: '빵', sort: 'recommended' })
    const item = result.products[0]

    expect(item.imageUrl).toBeNull()
  })

  it('storeName_name_생략_시_빈문자열_default', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        stores: [],
        products: [
          {
            kind: 'menu',
            id: 888,
            storeId: 2,
            price: 3000,
          },
        ],
      },
    })

    const result = await searchApi.search({ q: '음료', sort: 'recommended' })
    const item = result.products[0]

    expect(item.storeName).toBe('')
    expect(item.name).toBe('')
  })

  it('stores가_없으면_빈배열_default', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: { products: [dealPayload] },
    })

    const result = await searchApi.search({ q: '크루아상', sort: 'recommended' })

    expect(result.stores).toEqual([])
  })

  it('products가_없으면_빈배열_default', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: { stores: [storePayload] },
    })

    const result = await searchApi.search({ q: '베이커리', sort: 'recommended' })

    expect(result.products).toEqual([])
  })
})

describe('searchApi.autocomplete (자동완성)', () => {
  it('올바른_엔드포인트와_파라미터로_요청', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: [{ kind: 'store', text: '베이커리 브레드샵' }],
    })

    await searchApi.autocomplete({ q: '베이' })

    expect(apiClient.get).toHaveBeenCalledWith('/search/autocomplete', {
      params: { q: '베이' },
    })
  })

  it('배열_응답을_Zod_파싱하여_반환', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: [
        { kind: 'store', text: '베이커리 브레드샵' },
        { kind: 'product', text: '크루아상' },
      ],
    })

    const result = await searchApi.autocomplete({ q: '베이' })

    expect(result).toHaveLength(2)
  })

  it('store_kind_구분', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: [{ kind: 'store', text: '베이커리 브레드샵' }],
    })

    const result = await searchApi.autocomplete({ q: '베이' })

    expect(result[0].kind).toBe('store')
    expect(result[0].text).toBe('베이커리 브레드샵')
  })

  it('product_kind_구분', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: [{ kind: 'product', text: '크루아상' }],
    })

    const result = await searchApi.autocomplete({ q: '크루' })

    expect(result[0].kind).toBe('product')
  })

  it('빈_배열_응답_처리', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: [] })

    const result = await searchApi.autocomplete({ q: '존재안함zzz' })

    expect(result).toEqual([])
  })
})
