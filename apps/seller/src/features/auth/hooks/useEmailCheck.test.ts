import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useEmailCheck } from './useEmailCheck'
import { authApi } from '../api/authApi'
import { ApiError } from '@/shared/lib/apiError'
import { createQueryWrapper } from '@/shared/test/queryWrapper'

vi.mock('../api/authApi')

describe('useEmailCheck', () => {
  beforeEach(() => vi.clearAllMocks())

  it('이메일_사용가능_확인', async () => {
    vi.mocked(authApi.checkEmail).mockResolvedValue({ available: true })
    const { result } = renderHook(() => useEmailCheck(), { wrapper: createQueryWrapper() })

    result.current.mutate('new@magampick.com')

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ available: true })
  })

  it('이메일_중복_시_에러', async () => {
    vi.mocked(authApi.checkEmail).mockRejectedValue(
      new ApiError(409, 'EMAIL_ALREADY_EXISTS', '이미 사용 중인 이메일입니다'),
    )
    const { result } = renderHook(() => useEmailCheck(), { wrapper: createQueryWrapper() })

    result.current.mutate('taken@magampick.com')

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect((result.current.error as ApiError).code).toBe('EMAIL_ALREADY_EXISTS')
  })
})
