import { describe, it, expect, vi } from 'vitest'
import { paymentApi, mapToClientOrder, type TossConfirmResponse } from './paymentApi'
import { apiClient } from '@/shared/lib/axios'

vi.mock('@/shared/lib/axios', () => ({
  apiClient: { post: vi.fn() },
}))
const mockedPost = vi.mocked(apiClient.post)

const mockOrderResponse: TossConfirmResponse = {
  id: 42,
  orderNo: '0042',
  storeId: 1,
  storeName: '브레드샵',
  storePhone: '02-1234-5678',
  items: [
    {
      id: 10,
      kind: 'DEAL',
      name: '크루아상 세트',
      imageUrl: null,
      originalPrice: 10000,
      salePrice: 6000,
      qty: 2,
    },
  ],
  pickup: { type: 'SLOT', time: '18:30' },
  memo: '포장 부탁드려요',
  amounts: { normalTotal: 20000, discountTotal: 8000, payTotal: 12000 },
  pickupCode: '3827',
  status: 'PENDING',
  paymentMethod: 'toss',
  createdAt: '2026-06-10T10:00:00.000Z',
}

describe('paymentApi.confirm', () => {
  it('POST /payments/toss/confirm 로 body 를 전달하고 응답을 Zod parse', async () => {
    mockedPost.mockResolvedValueOnce({ data: mockOrderResponse })
    const result = await paymentApi.confirm({ paymentKey: 'pk_123', orderId: 42, amount: 12000 })
    expect(mockedPost).toHaveBeenCalledWith('/payments/toss/confirm', {
      paymentKey: 'pk_123',
      orderId: 42,
      amount: 12000,
    })
    expect(result.id).toBe(42)
    expect(result.storeName).toBe('브레드샵')
  })
})

describe('mapToClientOrder', () => {
  it('BE OrderResponse → 클라이언트 Order 타입으로 변환', () => {
    const order = mapToClientOrder(mockOrderResponse)
    expect(order.id).toBe('42')
    expect(order.storeId).toBe('1')
    expect(order.storeName).toBe('브레드샵')
    expect(order.pickupCode).toBe('3827')
    expect(order.status).toBe('PENDING')
    expect(order.paymentMethod).toBe('toss')
  })

  it('items: id 문자열 변환 · kind 소문자 변환', () => {
    const order = mapToClientOrder(mockOrderResponse)
    expect(order.items[0].id).toBe('10')
    expect(order.items[0].kind).toBe('deal')
    expect(order.items[0].qty).toBe(2)
  })

  it('pickup SLOT → type slot + time 포함', () => {
    const order = mapToClientOrder(mockOrderResponse)
    expect(order.pickup.type).toBe('slot')
    if (order.pickup.type === 'slot') {
      expect(order.pickup.time).toBe('18:30')
    }
  })

  it('pickup ASAP → type asap', () => {
    const order = mapToClientOrder({ ...mockOrderResponse, pickup: { type: 'ASAP' } })
    expect(order.pickup.type).toBe('asap')
  })

  it('amounts 정상가·할인·결제액 매핑', () => {
    const order = mapToClientOrder(mockOrderResponse)
    expect(order.amounts.normalTotal).toBe(20000)
    expect(order.amounts.discountTotal).toBe(8000)
    expect(order.amounts.payTotal).toBe(12000)
  })

  it('qty 범위 초과 시 1~10 클램핑', () => {
    const res: TossConfirmResponse = {
      ...mockOrderResponse,
      items: [{ ...mockOrderResponse.items![0], qty: 15 }],
    }
    const order = mapToClientOrder(res)
    expect(order.items[0].qty).toBe(10)
  })

  it('필수 필드 없을 때 기본값으로 구성', () => {
    const order = mapToClientOrder({})
    expect(order.id).toBe('0')
    expect(order.storeName).toBe('')
    expect(order.pickupCode).toBe('0000')
    expect(order.status).toBe('PENDING')
  })
})
