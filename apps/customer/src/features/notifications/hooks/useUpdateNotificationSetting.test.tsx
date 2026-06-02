import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { createQueryWrapper } from '@/shared/test/queryWrapper'
import { __resetNotificationsForTest } from '../api/notificationsApi'
import { useNotificationSettings } from './useNotificationSettings'
import { useUpdateNotificationSetting } from './useUpdateNotificationSetting'

describe('useUpdateNotificationSetting', () => {
  beforeEach(() => __resetNotificationsForTest())

  it('토글하면 설정 쿼리 캐시가 갱신된다', async () => {
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
