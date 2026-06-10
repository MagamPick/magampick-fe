import { describe, it, expect, vi, beforeEach } from 'vitest'
import { storeListApi } from './storeListApi'

vi.mock('@/shared/lib/axios', () => ({
  apiClient: {
    get: vi.fn(),
  },
}))

import { apiClient } from '@/shared/lib/axios'

const mockItem = (id: number) => ({
  id,
  name: `매장 ${id}`,
  imageUrl: null,
  distanceKm: 0.5,
  rating: 4.5,
  activeDealCount: 1,
  isFavorite: false,
})

const mockPage = (overrides?: Partial<ReturnType<typeof makePage>>) =>
  ({ data: makePage(overrides) })

function makePage(overrides?: object) {
  return {
    items: [mockItem(1), mockItem(2)],
    page: 0,
    size: 20,
    hasNext: false,
    total: 2,
    dealStoreCount: 2,
    ...overrides,
  }
}

beforeEach(() => {
  vi.mocked(apiClient.get).mockResolvedValue(mockPage())
})

describe('storeListApi.getStores', () => {
  it('올바른_엔드포인트와_파라미터로_요청', async () => {
    await storeListApi.getStores({ sort: 'recommended', page: 0 })

    expect(apiClient.get).toHaveBeenCalledWith('/stores', {
      params: { sort: 'recommended', page: 0, size: 20 },
    })
  })

  it('page_파라미터_전달_검증', async () => {
    await storeListApi.getStores({ sort: 'distance', page: 2 })

    expect(apiClient.get).toHaveBeenCalledWith('/stores', {
      params: { sort: 'distance', page: 2, size: 20 },
    })
  })

  it('offset_페이징_응답_파싱_hasNext_true', async () => {
    vi.mocked(apiClient.get).mockResolvedValue(
      mockPage({ hasNext: true, page: 0, total: 40, dealStoreCount: 15 }),
    )

    const result = await storeListApi.getStores({ sort: 'recommended' })

    expect(result.items).toHaveLength(2)
    expect(result.hasNext).toBe(true)
    expect(result.page).toBe(0)
    expect(result.total).toBe(40)
    expect(result.dealStoreCount).toBe(15)
  })

  it('마지막_페이지_hasNext_false', async () => {
    vi.mocked(apiClient.get).mockResolvedValue(
      mockPage({ hasNext: false, page: 1, total: 10 }),
    )

    const result = await storeListApi.getStores({ sort: 'rating', page: 1 })

    expect(result.hasNext).toBe(false)
    expect(result.page).toBe(1)
  })

  it('id가_number로_파싱', async () => {
    const result = await storeListApi.getStores({ sort: 'distance' })

    expect(typeof result.items[0].id).toBe('number')
    expect(result.items[0].id).toBe(1)
  })

  it('imageUrl_absent이면_null로_변환', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        items: [{ id: 1, name: '테스트', distanceKm: 0.5, rating: 4.0, activeDealCount: 0, isFavorite: false }],
        page: 0,
        size: 20,
        hasNext: false,
        total: 1,
        dealStoreCount: 0,
      },
    })

    const result = await storeListApi.getStores({ sort: 'recommended' })

    expect(result.items[0].imageUrl).toBeNull()
  })

  it('Zod_검증_통과_후_반환', async () => {
    const result = await storeListApi.getStores({ sort: 'recommended' })

    expect(result).toMatchObject({
      items: expect.any(Array),
      page: expect.any(Number),
      size: expect.any(Number),
      hasNext: expect.any(Boolean),
      total: expect.any(Number),
      dealStoreCount: expect.any(Number),
    })
  })
})
