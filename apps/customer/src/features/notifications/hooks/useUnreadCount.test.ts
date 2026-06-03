import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { createQueryWrapper } from '@/shared/test/queryWrapper'
import { __resetNotificationsForTest } from '../api/notificationsApi'
import { useUnreadCount } from './useUnreadCount'

describe('useUnreadCount', () => {
  beforeEach(() => __resetNotificationsForTest())

  it('미읽음 알림 수를 반환', async () => {
    const { result } = renderHook(() => useUnreadCount(), { wrapper: createQueryWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toBe(5)
  })
})
