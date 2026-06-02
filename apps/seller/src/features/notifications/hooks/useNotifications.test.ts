import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { createQueryWrapper } from '@/shared/test/queryWrapper'
import { __resetNotificationsForTest } from '../api/notificationsApi'
import { useNotifications } from './useNotifications'

describe('useNotifications', () => {
  beforeEach(() => __resetNotificationsForTest())

  it('알림을 최신순 단일 리스트로 반환', async () => {
    const { result } = renderHook(() => useNotifications(), { wrapper: createQueryWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(7)
    expect(result.current.data?.[0].id).toBe('sn1')
  })
})
