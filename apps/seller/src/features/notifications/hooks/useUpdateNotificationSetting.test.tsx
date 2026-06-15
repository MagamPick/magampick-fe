import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { createQueryWrapper } from '@/shared/test/queryWrapper'
import { useNotificationSettings } from './useNotificationSettings'
import { useUpdateNotificationSetting } from './useUpdateNotificationSetting'

vi.mock('@/shared/lib/axios')

import { apiClient } from '@/shared/lib/axios'

const beSettings = {
  newOrder: true,
  orderCancel: true,
  refundRequest: true,
  newReview: true,
  notice: true,
  marketing: false,
}

describe('useUpdateNotificationSetting', () => {
  beforeEach(() => vi.clearAllMocks())

  it('토글하면 설정 쿼리 캐시가 갱신된다', async () => {
    // 초기 GET → 원본 설정; onSettled invalidation 후 재조회 → 업데이트된 설정
    vi.mocked(apiClient.get)
      .mockResolvedValueOnce({ data: beSettings })
      .mockResolvedValue({ data: { ...beSettings, marketing: true } })
    vi.mocked(apiClient.patch).mockResolvedValue({ data: { ...beSettings, marketing: true } })

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
