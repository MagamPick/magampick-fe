import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/shared/lib/axios')

import { apiClient } from '@/shared/lib/axios'
import { clearanceApi } from './clearanceApi'

/** 최소 ClearanceItemResponse 픽스처 (BE spec) */
const mockItem = {
  id: 1,
  productId: 1,
  name: '통밀 식빵',
  regularPrice: 4800,
  salePrice: 2400,
  totalQuantity: 20,
  remainingQuantity: 12,
  pickupEndAt: '2026-06-01T21:00:00',
  status: 'OPEN' as const,
  createdAt: '2026-06-01T08:00:00.000Z',
}

describe('clearanceApi', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('listClearances', () => {
    it('storeId 로 떨이 목록을 조회하고 FE 뷰 모델로 매핑한다', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: { content: [mockItem] } })

      const result = await clearanceApi.listClearances(1)

      expect(apiClient.get).toHaveBeenCalledWith('/seller/stores/1/clearance-items', {
        params: { page: 0, size: 100, sort: 'createdAt,desc' },
      })
      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        id: 1,
        productId: 1,
        productName: '통밀 식빵',
        originalPrice: 4800,
        salePrice: 2400,
        totalQty: 20,
        soldQty: 8,       // 20 - 12
        remainingQty: 12,
        closeTime: '21:00',
        status: 'OPEN',
      })
    })

    it('content 가 비어 있으면 빈 배열을 반환한다', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: { content: [] } })
      const result = await clearanceApi.listClearances(1)
      expect(result).toEqual([])
    })
  })

  describe('getClearance', () => {
    it('storeId + id 로 단건 떨이를 조회한다', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockItem })

      const result = await clearanceApi.getClearance(1, 1)

      expect(apiClient.get).toHaveBeenCalledWith('/seller/stores/1/clearance-items/1')
      expect(result).toMatchObject({ id: 1, productName: '통밀 식빵', closeTime: '21:00' })
    })
  })

  describe('createClearance', () => {
    it('JSON 으로 떨이를 등록하고 생성된 뷰를 반환한다', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({
        data: { ...mockItem, id: 99, productId: 2, name: '아메리카노', regularPrice: 3000, salePrice: 1500, totalQuantity: 10, remainingQuantity: 10 },
      })

      const result = await clearanceApi.createClearance(1, {
        productId: 2,
        salePrice: 1500,
        totalQty: 10,
        closeTime: '21:00',
      })

      expect(apiClient.post).toHaveBeenCalledWith(
        '/seller/stores/1/clearance-items',
        expect.objectContaining({
          productId: 2,
          salePrice: 1500,
          totalQuantity: 10,
          pickupEndAt: expect.stringContaining('T21:00:00'),
        }),
      )
      expect(result).toMatchObject({ id: 99, salePrice: 1500, status: 'OPEN' })
    })
  })

  describe('updateClearance', () => {
    it('totalQuantity/salePrice/pickupEndAt 을 PATCH 로 수정하고 갱신된 뷰를 반환한다', async () => {
      const updated = { ...mockItem, totalQuantity: 13, remainingQuantity: 5 }
      vi.mocked(apiClient.patch).mockResolvedValue({ data: updated })

      const result = await clearanceApi.updateClearance(1, 1, { totalQuantity: 13 })

      expect(apiClient.patch).toHaveBeenCalledWith(
        '/seller/stores/1/clearance-items/1',
        { totalQuantity: 13 },
      )
      expect(result).toMatchObject({ totalQty: 13, remainingQty: 5 })
    })

    it('closeTime 을 전달하면 pickupEndAt ISO 로 변환해 전송한다', async () => {
      vi.mocked(apiClient.patch).mockResolvedValue({ data: mockItem })

      await clearanceApi.updateClearance(1, 1, { closeTime: '20:00' })

      expect(apiClient.patch).toHaveBeenCalledWith(
        '/seller/stores/1/clearance-items/1',
        { pickupEndAt: expect.stringContaining('T20:00:00') },
      )
    })
  })

  describe('closeClearance', () => {
    it('POST /close 로 떨이를 마감하고 결과 뷰를 반환한다', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ data: { ...mockItem, status: 'CLOSED' } })

      const result = await clearanceApi.closeClearance(1, 1)

      expect(apiClient.post).toHaveBeenCalledWith('/seller/stores/1/clearance-items/1/close')
      expect(result.status).toBe('CLOSED')
    })
  })
})
