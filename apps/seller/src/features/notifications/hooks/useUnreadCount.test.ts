import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { createQueryWrapper } from '@/shared/test/queryWrapper'
import { useUnreadCount } from './useUnreadCount'

vi.mock('@/shared/lib/axios')

import { apiClient } from '@/shared/lib/axios'

describe('useUnreadCount', () => {
  beforeEach(() => vi.clearAllMocks())

  it('미읽음 알림 수를 반환', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: { count: 3 } })
    const { result } = renderHook(() => useUnreadCount(), { wrapper: createQueryWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toBe(3)
  })
})
