import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { createQueryWrapper } from '@/shared/test/queryWrapper'
import { useNotifications } from './useNotifications'

vi.mock('@/shared/lib/axios')

import { apiClient } from '@/shared/lib/axios'

const beNotification = {
  id: 1,
  category: 'order',
  title: '새 주문이 들어왔어요',
  body: '빵순이님',
  createdAt: '2026-06-11T10:00:00.000Z',
  read: false,
  link: '/orders',
}

describe('useNotifications', () => {
  beforeEach(() => vi.clearAllMocks())

  it('알림을 최신순 단일 리스트로 반환', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: { items: [beNotification] } })
    const { result } = renderHook(() => useNotifications(), { wrapper: createQueryWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(1)
    expect(result.current.data?.[0].id).toBe('1')
  })
})
