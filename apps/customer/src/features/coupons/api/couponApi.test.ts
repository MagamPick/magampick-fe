import { describe, it, expect } from 'vitest'
import { couponApi } from './couponApi'

const NOW = new Date('2026-06-01T09:00:00+09:00')

// 파일 내 테스트는 순차 실행 — cp1 usable 검증을 use 변환보다 먼저 둔다.
describe('couponApi', () => {
  it('listCoupons — 만료일 경과분은 expired 로 보정', async () => {
    const list = await couponApi.listCoupons(NOW)
    expect(list.find((c) => c.id === 'cp6')?.status).toBe('expired') // 만료 2026-03-31
    expect(list.find((c) => c.id === 'cp1')?.status).toBe('usable') // 2026-06-30
    expect(list.find((c) => c.id === 'cp4')?.status).toBe('used')
  })

  it('listEvents — 받음 여부(claimed) 포함', async () => {
    const events = await couponApi.listEvents()
    expect(events.length).toBeGreaterThan(0)
    expect(events.every((e) => typeof e.claimed === 'boolean')).toBe(true)
  })

  it('claim — 쿠폰함에 usable 추가 + 1인 1회(재요청 거부)', async () => {
    const before = (await couponApi.listCoupons(NOW)).length
    const claimed = await couponApi.claim('ev5')
    expect(claimed.status).toBe('usable')
    expect(claimed.label).toBe('첫 주문 1천원 할인')
    expect((await couponApi.listCoupons(NOW)).length).toBe(before + 1)
    expect((await couponApi.listEvents()).find((e) => e.id === 'ev5')?.claimed).toBe(true)
    await expect(couponApi.claim('ev5')).rejects.toThrow()
  })

  it('use — usable 쿠폰을 used 로 전환', async () => {
    await couponApi.use('cp1', NOW)
    const list = await couponApi.listCoupons(NOW)
    expect(list.find((c) => c.id === 'cp1')?.status).toBe('used')
  })

  it('use — 없는 쿠폰 거부', async () => {
    await expect(couponApi.use('nope', NOW)).rejects.toThrow()
  })
})
