import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { createQueryWrapper } from '@/shared/test/queryWrapper'
import { useUnreadCount } from './useUnreadCount'

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

beforeEach(() => vi.clearAllMocks())

describe('useUnreadCount', () => {
  it('미읽음 알림 수를 반환', async () => {
    mockedGet.mockResolvedValueOnce({ data: { count: 3 } })

    const { result } = renderHook(() => useUnreadCount(), { wrapper: createQueryWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toBe(3)
  })
})
