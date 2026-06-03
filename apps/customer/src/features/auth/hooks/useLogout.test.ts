import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useLogout } from './useLogout'
import { authApi } from '../api/authApi'
import { useAuthStore } from '../stores/authStore'
import { ApiError } from '@/shared/lib/apiError'
import { createQueryWrapper } from '@/shared/test/queryWrapper'

const mockNavigate = vi.fn()
vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>()
  return { ...actual, useNavigate: () => mockNavigate }
})
vi.mock('../api/authApi')

describe('useLogout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.setState({
      accessToken: 'access-123',
      user: { id: 1, role: 'CUSTOMER', email: 'user@magampick.com' },
      isAuthenticated: true,
    })
  })

  it('로그아웃_성공_시_스토어_클리어_로그인이동', async () => {
    vi.mocked(authApi.logout).mockResolvedValue(undefined)
    const { result } = renderHook(() => useLogout(), { wrapper: createQueryWrapper() })

    result.current.mutate()

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(useAuthStore.getState().accessToken).toBe(null)
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
    expect(mockNavigate).toHaveBeenCalledWith('/login')
  })

  it('서버_실패해도_클라이언트_클리어_로그인이동', async () => {
    // onSettled 는 성공/실패 무관하게 정리 (auth.md §7 — 사용자 입장에선 항상 로그아웃)
    vi.mocked(authApi.logout).mockRejectedValue(new ApiError(500, 'SERVER_ERROR', '서버 오류'))
    const { result } = renderHook(() => useLogout(), { wrapper: createQueryWrapper() })

    result.current.mutate()

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
    expect(mockNavigate).toHaveBeenCalledWith('/login')
  })
})
