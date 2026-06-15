import { describe, it, expect, vi, beforeEach } from 'vitest'
import { opsApi } from './opsApi'
import { apiClient } from '@/shared/lib/axios'

vi.mock('@/shared/lib/axios', () => ({
  apiClient: { post: vi.fn() },
}))

const mockApi = apiClient as unknown as { post: ReturnType<typeof vi.fn> }

beforeEach(() => vi.clearAllMocks())

describe('opsApi.processSettlement', () => {
  it('targetDate 지정 시 body 에 담아 POST + processedCount 파싱', async () => {
    mockApi.post.mockResolvedValue({ data: { processedCount: 5 } })
    const r = await opsApi.processSettlement('2026-06-13')
    expect(mockApi.post).toHaveBeenCalledWith('/admin/settlements/process', {
      targetDate: '2026-06-13',
    })
    expect(r.processedCount).toBe(5)
  })

  it('targetDate 미지정 시 빈 body({}) 로 POST (서버가 오늘로 처리)', async () => {
    mockApi.post.mockResolvedValue({ data: { processedCount: 0 } })
    const r = await opsApi.processSettlement()
    expect(mockApi.post).toHaveBeenCalledWith('/admin/settlements/process', {})
    expect(r.processedCount).toBe(0)
  })

  it('processedCount 외 필드는 무시하고 number 만 파싱', async () => {
    mockApi.post.mockResolvedValue({ data: { processedCount: 12, extra: 'x' } })
    const r = await opsApi.processSettlement('2026-06-13')
    expect(r.processedCount).toBe(12)
  })
})

describe('opsApi.setSmsMock', () => {
  it('enabled=true 를 쿼리 파라미터로 POST', async () => {
    mockApi.post.mockResolvedValue({ data: undefined })
    await opsApi.setSmsMock(true)
    expect(mockApi.post).toHaveBeenCalledWith('/admin/sms/mock', null, {
      params: { enabled: true },
    })
  })

  it('enabled=false 를 쿼리 파라미터로 POST', async () => {
    mockApi.post.mockResolvedValue({ data: undefined })
    await opsApi.setSmsMock(false)
    expect(mockApi.post).toHaveBeenCalledWith('/admin/sms/mock', null, {
      params: { enabled: false },
    })
  })
})
