import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/shared/lib/axios', () => ({
  apiClient: { put: vi.fn() },
}))

import { apiClient } from '@/shared/lib/axios'
import { locationApi } from './locationApi'

const mockedPut = vi.mocked(apiClient.put)

beforeEach(() => vi.clearAllMocks())

describe('locationApi.updateMyLocation', () => {
  it('PUT /customers/me/location 으로 위경도를 보내고 응답을 파싱한다', async () => {
    mockedPut.mockResolvedValueOnce({
      data: {
        latitude: 37.5665,
        longitude: 126.978,
        locationUpdatedAt: '2026-06-11T14:03:00+09:00',
      },
    })

    const res = await locationApi.updateMyLocation({ latitude: 37.5665, longitude: 126.978 })

    expect(mockedPut).toHaveBeenCalledWith('/customers/me/location', {
      latitude: 37.5665,
      longitude: 126.978,
    })
    expect(res.locationUpdatedAt).toBe('2026-06-11T14:03:00+09:00')
  })

  it('위경도 범위를 벗어나면 전송 전에 거부한다', async () => {
    await expect(locationApi.updateMyLocation({ latitude: 999, longitude: 0 })).rejects.toThrow()
    expect(mockedPut).not.toHaveBeenCalled()
  })
})
