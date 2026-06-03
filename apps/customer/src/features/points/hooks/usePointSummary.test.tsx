import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { usePointSummary } from './usePointSummary'
import { pointApi } from '../api/pointApi'
import { createQueryWrapper } from '@/shared/test/queryWrapper'

vi.mock('../api/pointApi')

describe('usePointSummary', () => {
  beforeEach(() => vi.clearAllMocks())

  it('포인트 잔액을 조회한다', async () => {
    vi.mocked(pointApi.getSummary).mockResolvedValue({ balance: 2450 })

    const { result } = renderHook(() => usePointSummary(), { wrapper: createQueryWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ balance: 2450 })
  })
})
