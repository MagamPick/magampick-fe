import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/shared/lib/axios')

import { apiClient } from '@/shared/lib/axios'
import { refundApi } from './refundApi'

/** BE RefundResponse 단건 픽스처 */
const beRefund = {
  id: 1,
  orderId: 42,
  orderNo: '0042',
  storeId: 1,
  customerName: '테스터',
  items: [{ name: '크루아상', quantity: 2, price: 3000 }],
  amount: 6000,
  pickupCompletedAt: '2026-06-08T12:00:00.000Z',
  status: 'REQUESTED',
  reason: '상품이 예상과 달랐어요',
  requestedAt: '2026-06-09T10:00:00.000Z',
  rejectReason: null,
  resolvedAt: null,
}

describe('refundApi', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('listRefundRequests', () => {
    it('올바른 URL로 GET 요청하고 RefundRequest[] 로 매핑한다', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: [beRefund] })

      const result = await refundApi.listRefundRequests('1')

      expect(apiClient.get).toHaveBeenCalledWith('/seller/stores/1/refunds')
      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        id: '1',        // number → string
        orderId: '42',  // number → string
        storeId: '1',   // number → string
        orderNo: '0042',
        customerName: '테스터',
        amount: 6000,
        status: 'REQUESTED',
        reason: '상품이 예상과 달랐어요',
      })
    })

    it('items 의 name/quantity/price 를 올바르게 매핑한다', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: [beRefund] })

      const result = await refundApi.listRefundRequests('1')

      expect(result[0].items[0]).toMatchObject({
        name: '크루아상',
        quantity: 2,
        price: 3000,
      })
    })

    it('requestedAt desc 최신순으로 정렬한다', async () => {
      const older = { ...beRefund, id: 2, requestedAt: '2026-06-08T10:00:00.000Z' }
      const newer = { ...beRefund, id: 1, requestedAt: '2026-06-09T10:00:00.000Z' }
      vi.mocked(apiClient.get).mockResolvedValue({ data: [older, newer] })

      const result = await refundApi.listRefundRequests('1')

      expect(result[0].requestedAt > result[1].requestedAt).toBe(true)
      expect(result[0].id).toBe('1')
    })

    it('rejectReason·resolvedAt null 은 undefined 로 매핑한다', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: [beRefund] })

      const result = await refundApi.listRefundRequests('1')

      expect(result[0].rejectReason).toBeUndefined()
      expect(result[0].resolvedAt).toBeUndefined()
    })

    it('pickupCompletedAt null 은 빈 문자열로 매핑한다', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: [{ ...beRefund, pickupCompletedAt: null }],
      })

      const result = await refundApi.listRefundRequests('1')

      expect(result[0].pickupCompletedAt).toBe('')
    })

    it('strict status: enum 밖 값이면 parse 에서 throw 한다', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: [{ ...beRefund, status: 'PENDING' }],
      })

      await expect(refundApi.listRefundRequests('1')).rejects.toThrow()
    })
  })

  describe('approveRefund', () => {
    it('올바른 URL로 POST 요청하고 APPROVED 상태를 반환한다', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({
        data: {
          ...beRefund,
          status: 'APPROVED',
          resolvedAt: '2026-06-10T00:00:00.000Z',
        },
      })

      const result = await refundApi.approveRefund('1')

      expect(apiClient.post).toHaveBeenCalledWith('/seller/refunds/1/approve')
      expect(result.id).toBe('1')
      expect(result.status).toBe('APPROVED')
      expect(result.resolvedAt).toBe('2026-06-10T00:00:00.000Z')
    })
  })

  describe('rejectRefund', () => {
    it('올바른 URL로 POST 요청하고 rejectReason 바디를 전달한다', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({
        data: {
          ...beRefund,
          status: 'REJECTED',
          rejectReason: '거부 사유',
          resolvedAt: '2026-06-10T00:00:00.000Z',
        },
      })

      const result = await refundApi.rejectRefund('1', '거부 사유')

      expect(apiClient.post).toHaveBeenCalledWith('/seller/refunds/1/reject', {
        rejectReason: '거부 사유',
      })
      expect(result.status).toBe('REJECTED')
      expect(result.rejectReason).toBe('거부 사유')
      expect(result.resolvedAt).toBe('2026-06-10T00:00:00.000Z')
    })
  })
})
