import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import type { ReactNode } from 'react'
import { renderHook, waitFor, cleanup } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { profileKeys } from './profileQueryKeys'
import { useProfile } from './useProfile'
import { useUpdateName } from './useUpdateName'
import { profileApi } from '../api/profileApi'

vi.mock('../api/profileApi')

const mockProfile = {
  name: '김민수',
  email: 'minsoo@magampick.com',
  phone: '010-1234-5678',
  avatarEmoji: '👤',
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
    vi.clearAllMocks()
    vi.mocked(profileApi.getProfile).mockResolvedValue(mockProfile)
    vi.mocked(profileApi.updateName).mockResolvedValue({ ...mockProfile, name: '박상우' })
  })
  afterEach(() => cleanup())

  it('useProfile — 프로필(실명)을 불러온다', async () => {
    const { wrapper } = setup()
    const { result } = renderHook(() => useProfile(), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data!.name).toBe('김민수')
  })

  it('useUpdateName — 성공 시 profile 무효화', async () => {
    const { wrapper, invalidate } = setup()
    const { result } = renderHook(() => useUpdateName(), { wrapper })
    result.current.mutate('박상우')
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(invalidate).toHaveBeenCalledWith({ queryKey: profileKeys.all })
  })
})
