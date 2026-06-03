import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useBusinessCheck } from './useBusinessCheck'
import { authApi } from '../api/authApi'
import { ApiError } from '@/shared/lib/apiError'
import { createQueryWrapper } from '@/shared/test/queryWrapper'

vi.mock('../api/authApi')

describe('useBusinessCheck', () => {
  beforeEach(() => vi.clearAllMocks())

  it('정상_사업자_조회_성공', async () => {
    vi.mocked(authApi.checkBusinessNumber).mockResolvedValue({ verified: true })
    const { result } = renderHook(() => useBusinessCheck(), { wrapper: createQueryWrapper() })

    result.current.mutate({
      businessNumber: '123-45-67890',
      representativeName: '김사장',
      openDate: '2020-01-01',
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.verified).toBe(true)
  })

  it('조회되지_않는_사업자_에러', async () => {
    vi.mocked(authApi.checkBusinessNumber).mockRejectedValue(
      new ApiError(404, 'BUSINESS_NUMBER_INVALID', '조회되지 않는 사업자등록번호입니다'),
    )
    const { result } = renderHook(() => useBusinessCheck(), { wrapper: createQueryWrapper() })

    result.current.mutate({
      businessNumber: '000-45-67890',
      representativeName: '김사장',
      openDate: '2020-01-01',
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect((result.current.error as ApiError).code).toBe('BUSINESS_NUMBER_INVALID')
  })
})
