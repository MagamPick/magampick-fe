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

  it('진위확인 통과 시 (204 void) isSuccess 가 true 가 된다', async () => {
    vi.mocked(storeApi.checkBusinessNumber).mockResolvedValue(undefined)
    const { result } = renderHook(() => useVerifyBusiness(), { wrapper })

    result.current.mutate(input)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(storeApi.checkBusinessNumber).toHaveBeenCalledWith(input)
  })

  it('BUSINESS_INFO_MISMATCH 에러 시 isError 가 true 가 된다', async () => {
    vi.mocked(storeApi.checkBusinessNumber).mockRejectedValue(
      new ApiError(400, 'BUSINESS_INFO_MISMATCH', '사업자 정보가 일치하지 않습니다'),
    )
    const { result } = renderHook(() => useVerifyBusiness(), { wrapper })

    result.current.mutate(input)

    await waitFor(() => expect(result.current.isError).toBe(true))
  })

  it('BUSINESS_NUMBER_NOT_ACTIVE 에러 시 isError 가 true 가 된다', async () => {
    vi.mocked(storeApi.checkBusinessNumber).mockRejectedValue(
      new ApiError(400, 'BUSINESS_NUMBER_NOT_ACTIVE', '폐업·휴업 사업자입니다'),
    )
    const { result } = renderHook(() => useVerifyBusiness(), { wrapper })

    result.current.mutate({ ...input, businessNumber: '999-99-99999' })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
