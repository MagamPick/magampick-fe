import { describe, it, expect, beforeEach } from 'vitest'
import { refundApi, resetRefundsForTest } from './refundApi'
import { ApiError } from '@/shared/lib/apiError'

describe('refundApi (mock)', () => {
  beforeEach(() => resetRefundsForTest())

  describe('listRefundRequests', () => {
    it('본인 매장 환불 요청을 최신순으로 반환한다', async () => {
      const list = await refundApi.listRefundRequests('s1')
      expect(list.length).toBe(5)
      expect(list.every((r) => r.storeId === 's1')).toBe(true)
      const times = list.map((r) => new Date(r.requestedAt).getTime())
      expect(times).toEqual([...times].sort((a, b) => b - a))
    })

    it('환불 요청이 없는 매장은 빈 목록을 반환한다', async () => {
      expect(await refundApi.listRefundRequests('s2')).toEqual([])
    })
  })

  describe('approveRefund', () => {
    it('대기 중 요청을 승인하면 APPROVED 가 되고 처리 시각이 찍힌다', async () => {
      const result = await refundApi.approveRefund('rf1')
      expect(result.status).toBe('APPROVED')
      expect(result.resolvedAt).toBeTruthy()
    })

    it('이미 처리된 요청은 승인할 수 없다', async () => {
      await expect(refundApi.approveRefund('rf4')).rejects.toBeInstanceOf(ApiError)
      await expect(refundApi.approveRefund('rf4')).rejects.toThrow('이미 처리')
    })

    it('없는 요청은 404 를 던진다', async () => {
      await expect(refundApi.approveRefund('nope')).rejects.toThrow('찾을 수 없어요')
    })
  })

  describe('rejectRefund', () => {
    it('대기 중 요청을 사유와 함께 거부하면 REJECTED 가 된다', async () => {
      const result = await refundApi.rejectRefund('rf1', '이미 수령하신 상품이에요')
      expect(result.status).toBe('REJECTED')
      expect(result.rejectReason).toBe('이미 수령하신 상품이에요')
      expect(result.resolvedAt).toBeTruthy()
    })

    it('거부 사유가 비면 거부할 수 없다', async () => {
      await expect(refundApi.rejectRefund('rf1', '   ')).rejects.toThrow('거부 사유')
    })

    it('이미 처리된 요청은 거부할 수 없다', async () => {
      await expect(refundApi.rejectRefund('rf5', '사유')).rejects.toThrow('이미 처리')
    })
  })
})
