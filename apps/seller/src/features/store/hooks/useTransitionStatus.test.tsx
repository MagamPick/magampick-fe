import type { ReactNode } from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useTransitionStatus } from './useTransitionStatus'
import { storeKeys } from './storeKeys'
import { storeApi } from '../api/storeApi'
import { ApiError } from '@/shared/lib/apiError'

vi.mock('../api/storeApi')

// setQueryData 검증 위해 queryClient 를 직접 들고 wrapper 구성
function setup() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  return { queryClient, wrapper }
}

describe('useTransitionStatus', () => {
  beforeEach(() => vi.clearAllMocks())

  it('전환 성공 시 해당 매장 status 캐시를 갱신한다', async () => {
    vi.mocked(storeApi.transitionStatus).mockResolvedValue({
      storeId: 's1',
      operationStatus: 'BREAK',
      canOpenToday: true,
      todayCloseTime: '21:00',
    })
    const { queryClient, wrapper } = setup()
    const { result } = renderHook(() => useTransitionStatus('s1'), { wrapper })

    result.current.mutate('BREAK')

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(queryClient.getQueryData(storeKeys.status('s1'))).toMatchObject({
      operationStatus: 'BREAK',
    })
  })

  it('거부 시 에러를 노출한다', async () => {
    vi.mocked(storeApi.transitionStatus).mockRejectedValue(
      new ApiError(409, 'STORE_CLOSED_TODAY', '오늘은 영업 요일이 아니에요'),
    )
    const { wrapper } = setup()
    const { result } = renderHook(() => useTransitionStatus('s2'), { wrapper })

    result.current.mutate('OPEN')

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
