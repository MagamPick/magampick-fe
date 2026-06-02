import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { createQueryWrapper } from '@/shared/test/queryWrapper'
import { __resetNotificationsForTest } from '../api/notificationsApi'
import { useNotifications } from './useNotifications'

describe('useNotifications', () => {
  beforeEach(() => __resetNotificationsForTest())

  it('전체 세그먼트는 모든 알림을 최신순으로 반환', async () => {
    const { result } = renderHook(() => useNotifications('all'), { wrapper: createQueryWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(9)
    expect(result.current.data?.[0].id).toBe('n1')
  })

  it('마감 할인 세그먼트는 deal 알림만 반환', async () => {
    const { result } = renderHook(() => useNotifications('deal'), { wrapper: createQueryWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.map((n) => n.id)).toEqual(['n1', 'n3'])
  })
})
