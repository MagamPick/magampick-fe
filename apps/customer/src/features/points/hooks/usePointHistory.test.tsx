import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { usePointHistory } from './usePointHistory'
import { pointApi } from '../api/pointApi'
import { createQueryWrapper } from '@/shared/test/queryWrapper'

vi.mock('../api/pointApi')

describe('usePointHistory', () => {
  beforeEach(() => vi.clearAllMocks())

  it('선택한 필터를 api 에 전달한다', async () => {
    vi.mocked(pointApi.listHistory).mockResolvedValue([])

    const { result } = renderHook(() => usePointHistory('earn'), {
      wrapper: createQueryWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(pointApi.listHistory).toHaveBeenCalledWith('earn')
  })
})
