import { describe, it, expect, vi, beforeEach } from 'vitest'
import { pointApi } from './pointApi'
import { apiClient } from '@/shared/lib/axios'
import type { PointTransaction } from '../types'

vi.mock('@/shared/lib/axios', () => ({
  apiClient: { get: vi.fn() },
}))
const mockedGet = vi.mocked(apiClient.get)

const txn = (over: Partial<PointTransaction> = {}): PointTransaction => ({
  id: 1,
  reason: 'EARN',
  amount: 120,
  storeName: '브레드샵',
  occurredAt: '2026-05-28T10:00:00+09:00',
  ...over,
})

describe('pointApi', () => {
  beforeEach(() => vi.clearAllMocks())

  it('getSummary — BE 잔액 반환 + Zod 검증', async () => {
    mockedGet.mockResolvedValueOnce({ data: { balance: 2450 } })
    const s = await pointApi.getSummary()
    expect(s.balance).toBe(2450)
    expect(mockedGet).toHaveBeenCalledWith('/customers/me/points/summary')
  })

  it('getSummary — pendingPoints(적립 예정) 파싱 + null/누락 허용 (BE additive·D1)', async () => {
    // 적립 예정 합계 노출 — 환불 윈도우(3일) 종료 후 확정·사용 가능
    mockedGet.mockResolvedValueOnce({ data: { balance: 2450, pendingPoints: 300 } })
    expect((await pointApi.getSummary()).pendingPoints).toBe(300)

    // BE 미적립 시 null 직렬화 / 구 응답 누락 — 둘 다 parse 통과 (표시단 ?? 0)
    mockedGet.mockResolvedValueOnce({ data: { balance: 2450, pendingPoints: null } })
    expect((await pointApi.getSummary()).pendingPoints ?? 0).toBe(0)
    mockedGet.mockResolvedValueOnce({ data: { balance: 2450 } })
    expect((await pointApi.getSummary()).pendingPoints ?? 0).toBe(0)
  })

  it('listHistory — filter 파라미터를 BE로 전달', async () => {
    mockedGet.mockResolvedValueOnce({
      data: [txn({ reason: 'EARN', amount: 120 })],
    })
    const list = await pointApi.listHistory('EARN')
    expect(list).toHaveLength(1)
    expect(list[0].reason).toBe('EARN')
    expect(mockedGet).toHaveBeenCalledWith('/customers/me/points/history', {
      params: { filter: 'EARN' },
    })
  })

  it('listHistory(ALL) — 모든 사유 포함', async () => {
    mockedGet.mockResolvedValueOnce({
      data: [
        txn({ id: 1, reason: 'EARN' }),
        txn({ id: 2, reason: 'USE' }),
        txn({ id: 3, reason: 'EXPIRE' }),
        txn({ id: 4, reason: 'RESTORE' }),
        txn({ id: 5, reason: 'CLAWBACK' }),
      ],
    })
    const list = await pointApi.listHistory('ALL')
    expect(list).toHaveLength(5)
  })

  it('Zod 스키마 — id=number, occurredAt 포함, date 없음', async () => {
    mockedGet.mockResolvedValueOnce({
      data: [txn({ id: 10, occurredAt: '2026-05-28T10:00:00+09:00' })],
    })
    const list = await pointApi.listHistory('ALL')
    expect(typeof list[0].id).toBe('number')
    expect(list[0].occurredAt).toBe('2026-05-28T10:00:00+09:00')
  })
})
