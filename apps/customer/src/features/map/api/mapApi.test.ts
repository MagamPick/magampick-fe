import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/shared/lib/axios', () => ({
  apiClient: {
    get: vi.fn(),
  },
}))

import { apiClient } from '@/shared/lib/axios'
import { mapApi } from './mapApi'
import { mapStoreSchema } from '../types'

/** BE MapStoreResponse 픽처 */
const storeFixture = {
  id: 1,
  name: '베이커리 브레드샵',
  imageUrl: 'https://example.com/a.jpg',
  latitude: 37.556,
  longitude: 126.926,
  distanceKm: 0.3,
  rating: 4.6,
  activeDealCount: 2,
  maxDiscountRate: 40,
}

const CENTER = { latitude: 37.5571, longitude: 126.925 }

describe('mapApi.getMapStores (실 BE 연동)', () => {
  beforeEach(() => vi.clearAllMocks())

  it('GET /stores/map 에 파라미터 전송', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: [storeFixture] })
    await mapApi.getMapStores({ ...CENTER, radiusKm: 3, dealsOnly: true })
    expect(apiClient.get).toHaveBeenCalledWith('/stores/map', {
      params: { latitude: CENTER.latitude, longitude: CENTER.longitude, radiusKm: 3, dealsOnly: true },
    })
  })

  it('응답이_mapStoreSchema_배열로_파스되고_id_가_number', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: [storeFixture] })
    const result = await mapApi.getMapStores({ ...CENTER, radiusKm: 3, dealsOnly: false })
    expect(result).toHaveLength(1)
    expect(typeof result[0].id).toBe('number')
    expect(result[0].id).toBe(1)
    expect(() => mapStoreSchema.array().parse(result)).not.toThrow()
  })

  it('imageUrl_null_응답도_정상_파스', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: [{ ...storeFixture, imageUrl: null }] })
    const result = await mapApi.getMapStores({ ...CENTER, radiusKm: 3, dealsOnly: false })
    expect(result[0].imageUrl).toBeNull()
  })

  it('imageUrl_undefined_응답은_null_로_변환', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: [{ ...storeFixture, imageUrl: undefined }],
    })
    const result = await mapApi.getMapStores({ ...CENTER, radiusKm: 3, dealsOnly: false })
    expect(result[0].imageUrl).toBeNull()
  })

  it('빈_배열_응답도_정상_처리', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: [] })
    const result = await mapApi.getMapStores({ ...CENTER, radiusKm: 1, dealsOnly: true })
    expect(result).toHaveLength(0)
  })

  it('apiClient_에러는_그대로_전파', async () => {
    vi.mocked(apiClient.get).mockRejectedValue(new Error('네트워크 오류'))
    await expect(
      mapApi.getMapStores({ ...CENTER, radiusKm: 3, dealsOnly: false }),
    ).rejects.toThrow('네트워크 오류')
  })
})
