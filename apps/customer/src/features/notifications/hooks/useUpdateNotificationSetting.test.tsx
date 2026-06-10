import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { createQueryWrapper } from '@/shared/test/queryWrapper'
import { useNotificationSettings } from './useNotificationSettings'
import { useUpdateNotificationSetting } from './useUpdateNotificationSetting'

vi.mock('@/shared/lib/axios', () => ({
  apiClient: {
    get: vi.fn(),
    patch: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}))

import { apiClient } from '@/shared/lib/axios'
const mockedGet = vi.mocked(apiClient.get)
const mockedPatch = vi.mocked(apiClient.patch)

const defaultSettings = {
  nearbyDeal: true,
  favoriteStore: true,
  orderRefund: true,
  reviewReply: true,
  eventBenefit: false,
  marketing: false,
}

beforeEach(() => vi.clearAllMocks())

describe('useUpdateNotificationSetting', () => {
  it('토글하면 설정 쿼리 캐시가 갱신된다', async () => {
    // 초기 로드 → defaultSettings. mutation+invalidate 후 refetch → marketing:true 반환
    mockedGet
      .mockResolvedValueOnce({ data: defaultSettings })
      .mockResolvedValue({ data: { ...defaultSettings, marketing: true } })
    mockedPatch.mockResolvedValueOnce({
      data: { ...defaultSettings, marketing: true },
    })

    const { result } = renderHook(
      () => ({ settings: useNotificationSettings(), update: useUpdateNotificationSetting() }),
      { wrapper: createQueryWrapper() },
    )
    await waitFor(() => expect(result.current.settings.isSuccess).toBe(true))
    expect(result.current.settings.data?.marketing).toBe(false)

    act(() => {
      result.current.update.mutate({ key: 'marketing', on: true })
    })

    await waitFor(() => expect(result.current.settings.data?.marketing).toBe(true))
  })
})
