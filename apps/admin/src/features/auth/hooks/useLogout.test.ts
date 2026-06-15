import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useLogout } from './useLogout'
import { authApi } from '../api/authApi'
import { useAuthStore } from '../stores/authStore'
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
    useAuthStore.getState().setAccessToken('admin-token')
  })

  it('로그아웃_성공_시_clear후_로그인으로_이동', async () => {
    vi.mocked(authApi.logout).mockResolvedValue(undefined)
    const { result } = renderHook(() => useLogout(), { wrapper: createQueryWrapper() })

    result.current.mutate()

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/login'))
    expect(useAuthStore.getState().accessToken).toBe(null)
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
  })

  it('로그아웃_네트워크실패해도_clear후_로그인으로_이동', async () => {
    vi.mocked(authApi.logout).mockRejectedValue(new Error('network'))
    const { result } = renderHook(() => useLogout(), { wrapper: createQueryWrapper() })

    result.current.mutate()

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/login'))
    expect(useAuthStore.getState().accessToken).toBe(null)
  })
})
