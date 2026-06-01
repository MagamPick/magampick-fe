import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useClearances } from './useClearances'
import { clearanceApi } from '../api/clearanceApi'
import { createQueryWrapper } from '@/shared/test/queryWrapper'
import type { ClearanceView } from '../types'

vi.mock('../api/clearanceApi')

describe('useClearances', () => {
  beforeEach(() => vi.clearAllMocks())

  it('현재 매장 storeId 로 떨이 목록을 조회한다', async () => {
    vi.mocked(clearanceApi.listClearances).mockResolvedValue([] as ClearanceView[])
    const { result } = renderHook(() => useClearances('s1'), { wrapper: createQueryWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(clearanceApi.listClearances).toHaveBeenCalledWith('s1')
  })
})
