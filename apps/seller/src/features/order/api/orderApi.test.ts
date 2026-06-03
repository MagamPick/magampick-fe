import { describe, it, expect, beforeEach } from 'vitest'
import { orderApi, resetOrderState } from './orderApi'

describe('orderApi', () => {
  beforeEach(() => resetOrderState())

  describe('listOrders', () => {
    it('해당 매장 주문만 최신순(placedAt desc)으로 반환한다', async () => {
      const list = await orderApi.listOrders('s1')
      expect(list.length).toBeGreaterThan(0)
      expect(list.every((o) => o.storeId === 's1')).toBe(true)
      for (let i = 1; i < list.length; i++) {
        expect(list[i - 1].placedAt >= list[i].placedAt).toBe(true)
      }
    })

    it('주문이 없는 매장은 빈 배열을 반환한다 (빈 상태 확인용 s2)', async () => {
      expect(await orderApi.listOrders('s2')).toEqual([])
    })

    it('시드에 모든 종료 상태(거절·취소·미수령)가 포함된다', async () => {
      const statuses = new Set((await orderApi.listOrders('s1')).map((o) => o.status))
      expect(statuses.has('PENDING')).toBe(true)
      expect(statuses.has('PREPARING')).toBe(true)
      expect(statuses.has('READY')).toBe(true)
      expect(statuses.has('COMPLETED')).toBe(true)
      expect(statuses.has('REJECTED')).toBe(true)
      expect(statuses.has('CANCELLED')).toBe(true)
      expect(statuses.has('NO_SHOW')).toBe(true)
    })

    it('주문 단위 4자리 픽업 코드를 가진다', async () => {
      const list = await orderApi.listOrders('s1')
      expect(list.every((o) => /^\d{4}$/.test(o.pickupCode))).toBe(true)
    })
  })

  describe('getOrder', () => {
    it('id 로 주문 단건을 조회한다', async () => {
      const o = await orderApi.getOrder('o1')
      expect(o.id).toBe('o1')
      expect(o.items.length).toBeGreaterThan(0)
      expect(o.total).toBeGreaterThan(0)
    })

    it('없는 주문은 404 로 거부한다 (ORDER_NOT_FOUND)', async () => {
      await expect(orderApi.getOrder('nope')).rejects.toMatchObject({
        status: 404,
        code: 'ORDER_NOT_FOUND',
      })
    })
  })

  describe('상태 전이', () => {
    it('수락: PENDING → PREPARING', async () => {
      expect((await orderApi.acceptOrder('o1')).status).toBe('PREPARING')
    })

    it('거절: PENDING → REJECTED', async () => {
      expect((await orderApi.rejectOrder('o2')).status).toBe('REJECTED')
    })

    it('준비완료: PREPARING → READY', async () => {
      expect((await orderApi.readyOrder('o4')).status).toBe('READY')
    })

    it('수령완료: READY → COMPLETED', async () => {
      expect((await orderApi.completeOrder('o6')).status).toBe('COMPLETED')
    })

    it('미수령: READY → NO_SHOW', async () => {
      expect((await orderApi.noShowOrder('o6')).status).toBe('NO_SHOW')
    })

    it('전이 결과가 목록·조회에 반영된다', async () => {
      await orderApi.acceptOrder('o1')
      expect((await orderApi.getOrder('o1')).status).toBe('PREPARING')
    })

    it('정의되지 않은 전이는 409 로 거부한다 (ORDER_INVALID_TRANSITION)', async () => {
      // PENDING 에서 수령완료(수락·준비완료 건너뜀)
      await expect(orderApi.completeOrder('o1')).rejects.toMatchObject({
        status: 409,
        code: 'ORDER_INVALID_TRANSITION',
      })
      // 이미 수락된 주문(PREPARING) 재수락 불가
      await expect(orderApi.acceptOrder('o4')).rejects.toMatchObject({
        code: 'ORDER_INVALID_TRANSITION',
      })
      // 준비완료 후 거절 불가
      await expect(orderApi.rejectOrder('o6')).rejects.toMatchObject({
        code: 'ORDER_INVALID_TRANSITION',
      })
    })

    it('없는 주문 전이는 404 로 거부한다', async () => {
      await expect(orderApi.acceptOrder('nope')).rejects.toMatchObject({ status: 404 })
    })
  })

  it('resetOrderState 로 시드 상태가 복원된다', async () => {
    await orderApi.acceptOrder('o1')
    resetOrderState()
    expect((await orderApi.getOrder('o1')).status).toBe('PENDING')
  })
})
