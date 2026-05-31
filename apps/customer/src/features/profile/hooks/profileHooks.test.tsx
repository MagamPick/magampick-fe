import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import type { ReactNode } from 'react'
import { renderHook, waitFor, cleanup } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { profileKeys } from './profileQueryKeys'
import { useProfile } from './useProfile'
import { useProfileStats } from './useProfileStats'
import { useUpdateNickname } from './useUpdateNickname'
import { __resetProfileStoreForTest } from '../api/profileApi'

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
  beforeEach(() => __resetProfileStoreForTest())
  afterEach(() => cleanup())

  it('useProfile — 프로필을 불러온다', async () => {
    const { wrapper } = setup()
    const { result } = renderHook(() => useProfile(), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data!.nickname).toBe('마감픽사용자')
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

  it('useUpdateNickname — 2자 미만이면 거부된다', async () => {
    const { wrapper } = setup()
    const { result } = renderHook(() => useUpdateNickname(), { wrapper })
    result.current.mutate('a')
    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
