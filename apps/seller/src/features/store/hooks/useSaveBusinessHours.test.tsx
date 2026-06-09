import type { ReactNode } from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useSaveBusinessHours } from './useSaveBusinessHours'
import { storeKeys } from './storeKeys'
import { storeApi } from '../api/storeApi'
import { ApiError } from '@/shared/lib/apiError'
import type { BusinessHour } from '../types'

vi.mock('../api/storeApi')

// setQueryData / invalidateQueries 검증 위해 queryClient 를 직접 들고 wrapper 구성
function setup() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  return { queryClient, wrapper }
}

describe('useSaveBusinessHours', () => {
  beforeEach(() => vi.clearAllMocks())

  it('저장 성공 시 영업시간 캐시를 갱신하고 status 를 무효화한다', async () => {
    const saved: BusinessHour[] = [{ day: 'mon', openTime: '09:00', closeTime: '21:00' }]
    vi.mocked(storeApi.saveBusinessHours).mockResolvedValue(saved)
    const { queryClient, wrapper } = setup()
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useSaveBusinessHours(1), { wrapper })

    result.current.mutate(saved)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(queryClient.getQueryData(storeKeys.businessHours(1))).toEqual(saved)
    expect(invalidate).toHaveBeenCalledWith({ queryKey: storeKeys.status(1) })
  })

  it('거부(TODAY_BUSINESS_HOURS_LOCKED) 시 에러를 노출한다', async () => {
    vi.mocked(storeApi.saveBusinessHours).mockRejectedValue(
      new ApiError(409, 'TODAY_BUSINESS_HOURS_LOCKED', '영업 중에는 오늘 영업시간을 변경할 수 없어요'),
    )
    const { wrapper } = setup()
    const { result } = renderHook(() => useSaveBusinessHours(1), { wrapper })

    result.current.mutate([])

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
