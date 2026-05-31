import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useBusinessHours } from './useBusinessHours'
import { storeApi } from '../api/storeApi'
import { createQueryWrapper } from '@/shared/test/queryWrapper'
import type { BusinessHour } from '../types'

vi.mock('../api/storeApi')

describe('useBusinessHours', () => {
  beforeEach(() => vi.clearAllMocks())

  it('영업시간 조회 성공 시 영업일 행을 반환한다', async () => {
    const hours: BusinessHour[] = [{ day: 'mon', openTime: '09:00', closeTime: '21:00' }]
    vi.mocked(storeApi.getBusinessHours).mockResolvedValue(hours)

    const { result } = renderHook(() => useBusinessHours('s1'), {
      wrapper: createQueryWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(hours)
  })
})
