import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { usePasswordChange } from './usePasswordChange'
import { authApi } from '../api/authApi'
import { ApiError } from '@/shared/lib/apiError'
import { PASSWORD_CHANGE_ERROR } from '../types'
import { createQueryWrapper } from '@/shared/test/queryWrapper'

vi.mock('../api/authApi')

describe('usePasswordChange', () => {
  beforeEach(() => vi.clearAllMocks())

  it('비밀번호_변경에_성공한다', async () => {
    vi.mocked(authApi.changePassword).mockResolvedValue(undefined)
    const { result } = renderHook(() => usePasswordChange(), { wrapper: createQueryWrapper() })

    result.current.mutate({ currentPassword: 'Magampick1!', newPassword: 'abcd1234!' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(authApi.changePassword).toHaveBeenCalledWith({
      currentPassword: 'Magampick1!',
      newPassword: 'abcd1234!',
    })
  })

  it('현재_비밀번호_불일치면_CURRENT_PASSWORD_MISMATCH_에러를_전파한다', async () => {
    vi.mocked(authApi.changePassword).mockRejectedValue(
      new ApiError(
        400,
        PASSWORD_CHANGE_ERROR.CURRENT_PASSWORD_MISMATCH,
        '현재 비밀번호가 일치하지 않습니다',
      ),
    )
    const { result } = renderHook(() => usePasswordChange(), { wrapper: createQueryWrapper() })

    result.current.mutate({ currentPassword: 'wrongpass1!', newPassword: 'abcd1234!' })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect((result.current.error as ApiError).code).toBe(
      PASSWORD_CHANGE_ERROR.CURRENT_PASSWORD_MISMATCH,
    )
  })
})
