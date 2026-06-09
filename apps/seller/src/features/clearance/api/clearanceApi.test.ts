import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { clearanceApi, resetClearanceState } from './clearanceApi'
import { resetProductState } from '@/features/product/api/productApi'
import { storeApi } from '@/features/store/api/storeApi'
import type { CreateClearancePayload } from '../types'

/** p2 아메리카노(3000, onSale, 활성 떨이 없음) 기준 정상 페이로드 */
const base: CreateClearancePayload = {
  storeId: 's1',
  productId: 'p2',
  salePrice: 1500,
  totalQty: 10,
  closeTime: '20:00',
}

describe('clearanceApi', () => {
  beforeEach(() => {
    resetProductState()
    resetClearanceState()
    // getStoreStatus 는 실연동(apiClient) — 떨이 등록 검증 의존성을 영업중·마감 21:00 으로 stub.
    // (개별 케이스 STORE_NOT_OPEN 은 자체 spyOn 으로 override)
    vi.spyOn(storeApi, 'getStoreStatus').mockResolvedValue({
      storeId: 1,
      operationStatus: 'OPEN',
      canOpenToday: true,
      todayCloseTime: '21:00',
    })
    // Date 만 고정(타이머는 실제 유지 → delay 동작). 10:00 → s1 영업중 09–21 안
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 0, 1, 10, 0, 0))
  })
  afterEach(() => vi.useRealTimers())

  describe('listClearances', () => {
    it('해당 매장 떨이를 참조 상품 정보와 함께(join) 반환한다', async () => {
      const list = await clearanceApi.listClearances('s1')
      expect(list.length).toBeGreaterThan(0)
      const c1 = list.find((c) => c.id === 'c1')!
      expect(c1.productName).toBe('통밀 식빵')
      expect(c1.originalPrice).toBe(4800)
      expect(c1.remainingQty).toBe(c1.totalQty - c1.soldQty)
      expect(c1.status).toBe('ACTIVE')
    })

    it('떨이가 없는 매장은 빈 배열을 반환한다', async () => {
      expect(await clearanceApi.listClearances('s2')).toEqual([])
    })
  })

  describe('createClearance', () => {
    it('성공 시 ACTIVE 떨이를 생성한다 (판매 0, 남은 = 등록 수량)', async () => {
      const created = await clearanceApi.createClearance(base)
      expect(created.id).toBeTruthy()
      expect(created.status).toBe('ACTIVE')
      expect(created.soldQty).toBe(0)
      expect(created.remainingQty).toBe(10)
      expect(created.productName).toBe('아메리카노')
      expect(created.originalPrice).toBe(3000)

      const list = await clearanceApi.listClearances('s1')
      expect(list.some((c) => c.id === created.id)).toBe(true)
    })

    it('이미 활성 떨이가 있는 상품은 거부한다 (PRODUCT_ALREADY_ON_CLEARANCE)', async () => {
      // p1 에는 시드 c1(ACTIVE) 존재
      await expect(
        clearanceApi.createClearance({ ...base, productId: 'p1', salePrice: 2000 }),
      ).rejects.toMatchObject({ code: 'PRODUCT_ALREADY_ON_CLEARANCE' })
    })

    it('판매 중지(OFF) 상품은 거부한다 (PRODUCT_NOT_ON_SALE)', async () => {
      // p3 카페라떼 onSale false
      await expect(
        clearanceApi.createClearance({ ...base, productId: 'p3' }),
      ).rejects.toMatchObject({ code: 'PRODUCT_NOT_ON_SALE' })
    })

    it('할인가가 정상가 이상이면 거부한다 (CLEARANCE_PRICE_TOO_HIGH)', async () => {
      await expect(
        clearanceApi.createClearance({ ...base, salePrice: 3000 }),
      ).rejects.toMatchObject({ code: 'CLEARANCE_PRICE_TOO_HIGH' })
    })

    it('수량이 1 미만이면 거부한다 (CLEARANCE_INVALID_QTY)', async () => {
      await expect(
        clearanceApi.createClearance({ ...base, totalQty: 0 }),
      ).rejects.toMatchObject({ code: 'CLEARANCE_INVALID_QTY' })
    })

    it('픽업 마감이 현재 시각 이전이면 거부한다 (CLEARANCE_INVALID_CLOSE_TIME)', async () => {
      // now=10:00 → 09:00 은 과거
      await expect(
        clearanceApi.createClearance({ ...base, closeTime: '09:00' }),
      ).rejects.toMatchObject({ code: 'CLEARANCE_INVALID_CLOSE_TIME' })
    })

    it('픽업 마감이 영업 종료 이후면 거부한다 (CLEARANCE_CLOSE_AFTER_HOURS)', async () => {
      // s1 오늘 마감 21:00 → 21:30 거부
      await expect(
        clearanceApi.createClearance({ ...base, closeTime: '21:30' }),
      ).rejects.toMatchObject({ code: 'CLEARANCE_CLOSE_AFTER_HOURS' })
    })

    it('매장이 영업중(OPEN)이 아니면 거부한다 (STORE_NOT_OPEN)', async () => {
      vi.spyOn(storeApi, 'getStoreStatus').mockResolvedValue({
        storeId: 1,
        operationStatus: 'BREAK',
        canOpenToday: true,
        todayCloseTime: '21:00',
      })
      await expect(clearanceApi.createClearance(base)).rejects.toMatchObject({
        code: 'STORE_NOT_OPEN',
      })
    })
  })

  describe('updateClearance', () => {
    it('남은 수량을 수정하면 등록 수량(= 판매 + 남은)이 자동 갱신된다', async () => {
      // c1: 판매 8 / 등록 20
      const updated = await clearanceApi.updateClearance('c1', { remainingQty: 5 })
      expect(updated.status).toBe('ACTIVE')
      expect(updated.remainingQty).toBe(5)
      expect(updated.totalQty).toBe(13) // 8 + 5
    })

    it('남은 수량이 0 이면 자동 품절(SOLD_OUT)된다', async () => {
      const updated = await clearanceApi.updateClearance('c1', { remainingQty: 0 })
      expect(updated.status).toBe('SOLD_OUT')
      expect(updated.totalQty).toBe(8) // 판매 8 유지
    })

    it('할인가가 정상가 이상이면 거부한다 (CLEARANCE_PRICE_TOO_HIGH)', async () => {
      // c1 참조 상품 p1 정상가 4800
      await expect(
        clearanceApi.updateClearance('c1', { salePrice: 5000 }),
      ).rejects.toMatchObject({ code: 'CLEARANCE_PRICE_TOO_HIGH' })
    })

    it('마감된 떨이는 수정할 수 없다 (CLEARANCE_NOT_EDITABLE)', async () => {
      // c2 는 SOLD_OUT
      await expect(
        clearanceApi.updateClearance('c2', { salePrice: 1000 }),
      ).rejects.toMatchObject({ code: 'CLEARANCE_NOT_EDITABLE' })
    })
  })

  describe('closeClearance', () => {
    it('활성 떨이를 수동 마감하면 CLOSED(MANUAL)이 된다', async () => {
      const closed = await clearanceApi.closeClearance('c1')
      expect(closed.status).toBe('CLOSED')
      expect(closed.closeReason).toBe('MANUAL')
    })

    it('이미 마감된 떨이는 다시 마감할 수 없다 (CLEARANCE_NOT_EDITABLE)', async () => {
      await expect(clearanceApi.closeClearance('c2')).rejects.toMatchObject({
        code: 'CLEARANCE_NOT_EDITABLE',
      })
    })
  })

  describe('closeActiveByProduct', () => {
    it('상품의 활성 떨이를 자동 마감한다 (상품 삭제 시)', async () => {
      await clearanceApi.closeActiveByProduct('p1') // c1(ACTIVE) → CLOSED
      const c1 = await clearanceApi.getClearance('c1')
      expect(c1.status).toBe('CLOSED')
      expect(c1.closeReason).toBe('MANUAL')
    })

    it('활성 떨이가 없으면 아무것도 하지 않는다', async () => {
      // p2 는 c2(SOLD_OUT)만 — 활성 없음
      await expect(clearanceApi.closeActiveByProduct('p2')).resolves.toBeUndefined()
      const c2 = await clearanceApi.getClearance('c2')
      expect(c2.status).toBe('SOLD_OUT')
    })
  })
})
