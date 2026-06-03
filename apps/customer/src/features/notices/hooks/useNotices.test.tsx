import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useNotices } from './useNotices'
import { noticeApi } from '../api/noticeApi'
import { createQueryWrapper } from '@/shared/test/queryWrapper'

vi.mock('../api/noticeApi')

describe('useNotices', () => {
  beforeEach(() => vi.clearAllMocks())

  it('발행된 공지 목록을 조회한다', async () => {
    vi.mocked(noticeApi.listNotices).mockResolvedValue([])

    const { result } = renderHook(() => useNotices(), { wrapper: createQueryWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(noticeApi.listNotices).toHaveBeenCalledOnce()
  })
})
