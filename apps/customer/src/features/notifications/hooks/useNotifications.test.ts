import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { createQueryWrapper } from '@/shared/test/queryWrapper'
import { useNotifications } from './useNotifications'

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

const makeItem = (id: number, category: string) => ({
  id,
  category,
  title: `알림 ${id}`,
  body: `본문 ${id}`,
  createdAt: '2026-06-10T10:00:00+09:00',
  read: false,
  link: null,
})

beforeEach(() => vi.clearAllMocks())

describe('useNotifications', () => {
  it('전체 세그먼트는 모든 알림을 반환', async () => {
    const items = [makeItem(1, 'deal'), makeItem(2, 'order'), makeItem(3, 'system')]
    mockedGet.mockResolvedValueOnce({ data: { items } })

    const { result } = renderHook(() => useNotifications('all'), { wrapper: createQueryWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toHaveLength(3)
    expect(result.current.data?.[0].id).toBe(1)
  })

  it('마감 할인 세그먼트는 deal 알림만 반환', async () => {
    const items = [makeItem(1, 'deal'), makeItem(2, 'deal')]
    mockedGet.mockResolvedValueOnce({ data: { items } })

    const { result } = renderHook(() => useNotifications('deal'), { wrapper: createQueryWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.every((n) => n.category === 'deal')).toBe(true)
  })
})
