import { describe, it, expect, vi, beforeEach } from 'vitest'
import { eventApi } from './eventApi'
import { apiClient } from '@/shared/lib/axios'
import type { AdminCouponResponse, EventMutationPayload } from '../types'

vi.mock('@/shared/lib/axios', () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), patch: vi.fn() },
}))

const mockApi = apiClient as unknown as {
  get: ReturnType<typeof vi.fn>
  post: ReturnType<typeof vi.fn>
  patch: ReturnType<typeof vi.fn>
}

const sample: AdminCouponResponse = {
  id: 1,
  label: '여름 마감 쿠폰',
  discountType: 'RATE',
  value: 10,
  minOrder: 10000,
  validUntil: '2026-07-31',
  issueLimit: 100,
  issuedCount: 3,
  active: true,
  displayStartAt: '2026-06-20',
  displayEndAt: '2026-07-20',
  status: 'ongoing',
}

const payload: EventMutationPayload = {
  label: '여름 마감 쿠폰',
  discountType: 'RATE',
  value: 10,
  minOrder: 10000,
  validUntil: '2026-07-31',
  issueLimit: 100,
  displayStartAt: '2026-06-20',
  displayEndAt: '2026-07-20',
}

beforeEach(() => vi.clearAllMocks())

describe('eventApi', () => {
  it('listEvents — GET /admin/coupons 배열을 파싱', async () => {
    mockApi.get.mockResolvedValue({ data: [sample] })
    const r = await eventApi.listEvents()
    expect(mockApi.get).toHaveBeenCalledWith('/admin/coupons')
    expect(r).toHaveLength(1)
    expect(r[0].id).toBe(1)
  })

  it('listEvents — issueLimit null(무제한) 응답도 파싱', async () => {
    mockApi.get.mockResolvedValue({ data: [{ ...sample, issueLimit: null }] })
    const r = await eventApi.listEvents()
    expect(r[0].issueLimit).toBeNull()
  })

  it('createEvent — value 필드로 전송(discountValue 아님)', async () => {
    mockApi.post.mockResolvedValue({ data: sample })
    await eventApi.createEvent({ ...payload, value: 15 })
    expect(mockApi.post).toHaveBeenCalledWith('/admin/coupons', expect.objectContaining({ value: 15 }))
    const body = mockApi.post.mock.calls[0][1]
    expect(body).not.toHaveProperty('discountValue')
  })

  it('createEvent — 무제한이면 issueLimit null 전송', async () => {
    mockApi.post.mockResolvedValue({ data: { ...sample, issueLimit: null } })
    await eventApi.createEvent({ ...payload, issueLimit: null })
    expect(mockApi.post.mock.calls[0][1].issueLimit).toBeNull()
  })

  it('updateEvent — ⚠ value→discountValue 매핑 (value 키 없음)', async () => {
    mockApi.patch.mockResolvedValue({ data: { ...sample, value: 25 } })
    await eventApi.updateEvent(7, { ...payload, value: 25 })
    expect(mockApi.patch).toHaveBeenCalledWith(
      '/admin/coupons/7',
      expect.objectContaining({ discountValue: 25 }),
    )
    const body = mockApi.patch.mock.calls[0][1]
    expect(body).not.toHaveProperty('value')
  })

  it('endEvent — POST /admin/coupons/{id}/end, ended 응답', async () => {
    mockApi.post.mockResolvedValue({ data: { ...sample, active: false, status: 'ended' } })
    const r = await eventApi.endEvent(7)
    expect(mockApi.post).toHaveBeenCalledWith('/admin/coupons/7/end')
    expect(r.active).toBe(false)
    expect(r.status).toBe('ended')
  })
})
