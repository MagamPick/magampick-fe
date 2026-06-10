import { describe, it, expect, vi, beforeEach } from 'vitest'
import { apiClient } from '@/shared/lib/axios'
import { ApiError } from '@/shared/lib/apiError'
import { favoritesApi } from './favoritesApi'
import { FAVORITE_ERROR } from '../types'

vi.mock('@/shared/lib/axios', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}))

beforeEach(() => vi.clearAllMocks())

describe('favoritesApi', () => {
  describe('list', () => {
    it('GET /customers/me/favorites 호출 후 favoriteListSchema 파싱 반환', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: {
          stores: [
            { id: 1, name: '브레드샵', distanceKm: 0.3, rating: 4.8, activeDealCount: 2 },
            { id: 2, name: '북카페 무드', distanceKm: 0.6, rating: 4.6, activeDealCount: 0 },
          ],
          totalCount: 2,
          totalActiveDealCount: 2,
        },
      })

      const result = await favoritesApi.list()

      expect(apiClient.get).toHaveBeenCalledWith('/customers/me/favorites')
      expect(result.stores).toHaveLength(2)
      expect(result.stores[0].id).toBe(1)
      expect(result.totalCount).toBe(2)
      expect(result.totalActiveDealCount).toBe(2)
    })

    it('BE stores 필드 absent 시 빈 배열·0 기본값 반환', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: {} })

      const result = await favoritesApi.list()

      expect(result.stores).toEqual([])
      expect(result.totalCount).toBe(0)
      expect(result.totalActiveDealCount).toBe(0)
    })

    it('store.imageUrl absent → null 변환', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: {
          stores: [{ id: 3, name: '매장A' }], // imageUrl 필드 없음
        },
      })

      const result = await favoritesApi.list()

      expect(result.stores[0].imageUrl).toBeNull()
    })
  })

  describe('add', () => {
    it('POST /customers/me/favorites body { storeId: number } 호출', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ data: { storeId: 42, createdAt: '2024-01-01T00:00:00Z' } })

      await favoritesApi.add(42)

      expect(apiClient.post).toHaveBeenCalledWith('/customers/me/favorites', { storeId: 42 })
    })

    it('void 반환 (응답 body 미사용)', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ data: { storeId: 1 } })

      const result = await favoritesApi.add(1)

      expect(result).toBeUndefined()
    })

    it('409 FAVORITE_LIMIT_REACHED — ApiError 그대로 throw 전파', async () => {
      vi.mocked(apiClient.post).mockRejectedValue(
        new ApiError(409, FAVORITE_ERROR.LIMIT_REACHED, '단골매장은 최대 50개까지 등록할 수 있어요'),
      )

      await expect(favoritesApi.add(99)).rejects.toMatchObject({
        status: 409,
        code: FAVORITE_ERROR.LIMIT_REACHED,
      })
    })
  })

  describe('remove', () => {
    it('DELETE /customers/me/favorites/{storeId} 호출', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({ data: null })

      await favoritesApi.remove(7)

      expect(apiClient.delete).toHaveBeenCalledWith('/customers/me/favorites/7')
    })

    it('void 반환', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({ data: null })

      const result = await favoritesApi.remove(1)

      expect(result).toBeUndefined()
    })
  })
})
