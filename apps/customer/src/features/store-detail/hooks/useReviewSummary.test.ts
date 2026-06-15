import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { createQueryWrapper } from '@/shared/test/queryWrapper'
import { storeDetailApi } from '../api/storeDetailApi'
import { useReviewSummary } from './useReviewSummary'

vi.mock('../api/storeDetailApi')

describe('useReviewSummary', () => {
  it('리뷰_요약_조회_성공', async () => {
    vi.mocked(storeDetailApi.getReviewSummary).mockResolvedValue({
      average: 4.8,
      count: 412,
      distribution: [
        { star: 5, count: 338 },
        { star: 4, count: 49 },
        { star: 3, count: 16 },
        { star: 2, count: 5 },
        { star: 1, count: 4 },
      ],
    })

    const { result } = renderHook(() => useReviewSummary(1), { wrapper: createQueryWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.average).toBe(4.8)
    expect(result.current.data?.distribution).toHaveLength(5)
    expect(storeDetailApi.getReviewSummary).toHaveBeenCalledWith(1)
  })
})
