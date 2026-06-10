import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/shared/lib/axios')

import { apiClient } from '@/shared/lib/axios'
import { orderApi } from './orderApi'

/** BE SellerOrderResponse 단건 픽스처 */
const beOrder = {
  id: 1,
  orderNo: '0001',
  storeId: 2,
  storeName: '동네빵집',
  storePhone: '0212345678',
  items: [
    {
      id: 10,
      kind: 'MENU',
      name: '크루아상',
      imageUrl: null,
      originalPrice: 4000,
      salePrice: 3000,
      qty: 2,
    },
  ],
  pickup: { type: 'SLOT', time: '14:30' },
  memo: '포장 부탁드려요',
  amounts: { normalTotal: 8000, discountTotal: 2000, payTotal: 6000 },
  pickupCode: '4827',
  status: 'PENDING',
  paymentMethod: 'toss',
  createdAt: '2026-06-10T04:30:00.000Z',
  customerName: '빵순이',
  customerPhone: '010-2847-3920',
  acceptedAt: null,
  readyAt: null,
  completedAt: null,
  rejectedAt: null,
  cancelledAt: null,
}

describe('orderApi', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('listOrders', () => {
    it('올바른 URL로 GET 요청하고 Order[] 로 매핑한다', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: [beOrder] })

      const result = await orderApi.listOrders('2')

      expect(apiClient.get).toHaveBeenCalledWith('/seller/stores/2/orders')
      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        id: '1',               // number → string
        storeId: '2',          // number → string
        orderNo: '0001',
        customerName: '빵순이',
        customerPhone: '010-2847-3920',
        placedAt: '2026-06-10T04:30:00.000Z', // createdAt → placedAt
        pickupTime: '14:30',   // SLOT 시 time 사용
        pickupCode: '4827',
        status: 'PENDING',
        total: 6000,           // amounts.payTotal → total
        paymentMethod: '토스페이', // 'toss' → '토스페이'
      })
    })

    it('items[].qty → quantity, salePrice → price 로 매핑한다', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: [beOrder] })

      const result = await orderApi.listOrders('2')

      expect(result[0].items[0]).toMatchObject({
        name: '크루아상',
        quantity: 2,   // qty → quantity
        price: 3000,   // salePrice → price
      })
    })

    it('pickup type=ASAP 이면 pickupTime을 "ASAP" 으로 매핑한다', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: [{ ...beOrder, pickup: { type: 'ASAP' } }],
      })

      const result = await orderApi.listOrders('2')

      expect(result[0].pickupTime).toBe('ASAP')
    })

    it('pickup type=SLOT 이지만 time 없으면 "ASAP" 으로 폴백한다', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: [{ ...beOrder, pickup: { type: 'SLOT' } }],
      })

      const result = await orderApi.listOrders('2')

      expect(result[0].pickupTime).toBe('ASAP')
    })

    it('pickup 소문자 type(asap/slot)도 대소문자 무시하고 처리한다', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: [{ ...beOrder, pickup: { type: 'slot', time: '15:00' } }],
      })

      const result = await orderApi.listOrders('2')

      expect(result[0].pickupTime).toBe('15:00')
    })

    it('paymentMethod "toss" 는 "토스페이" 표시 라벨로 변환한다', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: [beOrder] })

      const result = await orderApi.listOrders('2')

      expect(result[0].paymentMethod).toBe('토스페이')
    })

    it('placedAt desc 최신순으로 정렬한다', async () => {
      const older = { ...beOrder, id: 2, createdAt: '2026-06-10T03:00:00.000Z' }
      const newer = { ...beOrder, id: 1, createdAt: '2026-06-10T04:00:00.000Z' }
      vi.mocked(apiClient.get).mockResolvedValue({ data: [older, newer] })

      const result = await orderApi.listOrders('2')

      expect(result[0].placedAt > result[1].placedAt).toBe(true)
      expect(result[0].id).toBe('1')
    })

    it('strict status: 7-enum 밖 값이면 parse 에서 throw 한다', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: [{ ...beOrder, status: 'AWAITING_PAYMENT' }],
      })

      await expect(orderApi.listOrders('2')).rejects.toThrow()
    })
  })

  describe('getOrder', () => {
    it('올바른 URL로 GET 요청하고 단건 Order 를 반환한다', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: beOrder })

      const result = await orderApi.getOrder('1')

      expect(apiClient.get).toHaveBeenCalledWith('/seller/orders/1')
      expect(result.id).toBe('1')
      expect(result.status).toBe('PENDING')
    })

    it('strict status: 7-enum 밖 값이면 parse 에서 throw 한다', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: { ...beOrder, status: 'UNKNOWN_STATUS' },
      })

      await expect(orderApi.getOrder('1')).rejects.toThrow()
    })
  })

  describe('acceptOrder', () => {
    it('올바른 URL로 POST 요청하고 매핑된 Order 를 반환한다', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ data: { ...beOrder, status: 'PREPARING' } })

      const result = await orderApi.acceptOrder('1')

      expect(apiClient.post).toHaveBeenCalledWith('/seller/orders/1/accept')
      expect(result.status).toBe('PREPARING')
    })
  })

  describe('rejectOrder', () => {
    it('올바른 URL로 POST 요청하고 매핑된 Order 를 반환한다', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ data: { ...beOrder, status: 'REJECTED' } })

      const result = await orderApi.rejectOrder('1')

      expect(apiClient.post).toHaveBeenCalledWith('/seller/orders/1/reject')
      expect(result.status).toBe('REJECTED')
    })
  })

  describe('readyOrder', () => {
    it('올바른 URL로 POST 요청하고 매핑된 Order 를 반환한다', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ data: { ...beOrder, status: 'READY' } })

      const result = await orderApi.readyOrder('1')

      expect(apiClient.post).toHaveBeenCalledWith('/seller/orders/1/ready')
      expect(result.status).toBe('READY')
    })
  })

  describe('completeOrder', () => {
    it('올바른 URL로 POST 요청하고 매핑된 Order 를 반환한다', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ data: { ...beOrder, status: 'COMPLETED' } })

      const result = await orderApi.completeOrder('1')

      expect(apiClient.post).toHaveBeenCalledWith('/seller/orders/1/complete')
      expect(result.status).toBe('COMPLETED')
    })
  })

  describe('noShowOrder', () => {
    it('올바른 URL로 POST 요청하고 매핑된 Order 를 반환한다', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ data: { ...beOrder, status: 'NO_SHOW' } })

      const result = await orderApi.noShowOrder('1')

      expect(apiClient.post).toHaveBeenCalledWith('/seller/orders/1/no-show')
      expect(result.status).toBe('NO_SHOW')
    })
  })
})
