import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import type { ReactNode } from 'react'
import { renderHook, waitFor, cleanup } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { profileKeys } from './profileQueryKeys'
import { useProfile } from './useProfile'
import { useProfileStats } from './useProfileStats'
import { useUpdateNickname } from './useUpdateNickname'
import { profileApi } from '../api/profileApi'

vi.mock('../api/profileApi', () => ({
  profileApi: {
    getProfile: vi.fn(),
    getStats: vi.fn(),
    updateNickname: vi.fn(),
  },
}))

const MOCK_PROFILE = {
  nickname: '테스트닉네임',
  email: 'user@magampick.com',
  phone: '010-1234-5678',
  avatarEmoji: '🐶',
}

const MOCK_STATS = {
  monthlySavings: 14300,
  rescuedCount: 4,
  favoriteCount: 4,
}

function setup() {
  const qc = new QueryClient({
    // gcTime 0 + unmount(cleanup) → 캐시 gc 타이머가 안 남아 vitest 워커가 깔끔히 종료
    defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false } },
  })
  const invalidate = vi.spyOn(qc, 'invalidateQueries')
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  )
  return { invalidate, wrapper }
}

describe('profile hooks', () => {
  beforeEach(() => {
    vi.mocked(profileApi.getProfile).mockResolvedValue(MOCK_PROFILE)
    vi.mocked(profileApi.getStats).mockResolvedValue(MOCK_STATS)
    vi.mocked(profileApi.updateNickname).mockResolvedValue({ ...MOCK_PROFILE, nickname: '새닉네임' })
  })
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('useProfile — 프로필을 불러온다', async () => {
    const { wrapper } = setup()
    const { result } = renderHook(() => useProfile(), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data!.nickname).toBe('테스트닉네임')
  })

  it('useProfileStats — 통계를 불러온다', async () => {
    const { wrapper } = setup()
    const { result } = renderHook(() => useProfileStats(), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data!.favoriteCount).toBeGreaterThanOrEqual(0)
  })

  it('useUpdateNickname — 성공 시 profile 무효화', async () => {
    const { wrapper, invalidate } = setup()
    const { result } = renderHook(() => useUpdateNickname(), { wrapper })
    result.current.mutate('새닉네임')
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(invalidate).toHaveBeenCalledWith({ queryKey: profileKeys.all })
  })

  it('useUpdateNickname — API 오류 시 isError 상태', async () => {
    vi.mocked(profileApi.updateNickname).mockRejectedValue(new Error('BE 오류'))
    const { wrapper } = setup()
    const { result } = renderHook(() => useUpdateNickname(), { wrapper })
    result.current.mutate('새닉네임')
    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
