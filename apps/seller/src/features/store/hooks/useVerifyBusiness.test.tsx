import type { ReactNode } from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useVerifyBusiness } from './useVerifyBusiness'
import { storeApi } from '../api/storeApi'
import { ApiError } from '@/shared/lib/apiError'

vi.mock('../api/storeApi')

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

const input = { businessNumber: '123-45-67890', representativeName: '김사장', openDate: '2020-03-02' }

describe('useVerifyBusiness', () => {
  beforeEach(() => vi.clearAllMocks())

  it('진위확인 통과 시 verified 를 반환한다', async () => {
    vi.mocked(storeApi.checkBusinessNumber).mockResolvedValue({ verified: true })
    const { result } = renderHook(() => useVerifyBusiness(), { wrapper })

    result.current.mutate(input)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(storeApi.checkBusinessNumber).toHaveBeenCalledWith(input)
  })

  it('조회 실패(000 시작) 시 에러를 노출한다', async () => {
    vi.mocked(storeApi.checkBusinessNumber).mockRejectedValue(
      new ApiError(404, 'BUSINESS_NUMBER_INVALID', '조회되지 않는 사업자등록번호입니다'),
    )
    const { result } = renderHook(() => useVerifyBusiness(), { wrapper })

    result.current.mutate({ ...input, businessNumber: '000-45-67890' })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
