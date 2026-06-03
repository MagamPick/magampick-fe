import type { ReactNode } from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useCreateStore } from './useCreateStore'
import { storeKeys } from './storeKeys'
import { storeApi } from '../api/storeApi'
import { ApiError } from '@/shared/lib/apiError'
import type { CreateStoreInput, StoreSummary } from '../types'

vi.mock('../api/storeApi')

// invalidateQueries 검증 위해 queryClient 를 직접 들고 wrapper 구성
function setup() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  return { queryClient, wrapper }
}

const input: CreateStoreInput = {
  representativeName: '김사장',
  businessNumber: '123-45-67890',
  openDate: '2020-03-02',
  storeName: '마감픽 베이커리 신촌점',
  storeAddress: '서울 마포구 신촌로 123',
  storeAddressDetail: '1층',
  storePhone: '02-1234-5678',
  photoAdded: true,
}

describe('useCreateStore', () => {
  beforeEach(() => vi.clearAllMocks())

  it('등록 성공 시 createStore 를 호출하고 보유 매장 목록을 무효화한다', async () => {
    const created: StoreSummary = { id: 's3', name: input.storeName, operationStatus: 'CLOSED_TODAY' }
    vi.mocked(storeApi.createStore).mockResolvedValue(created)
    const { queryClient, wrapper } = setup()
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useCreateStore(), { wrapper })

    result.current.mutate(input)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(storeApi.createStore).toHaveBeenCalledWith(input)
    expect(invalidate).toHaveBeenCalledWith({ queryKey: storeKeys.list() })
    expect(result.current.data).toEqual(created)
  })

  it('거부(BUSINESS_NUMBER_FORMAT_INVALID) 시 에러를 노출한다', async () => {
    vi.mocked(storeApi.createStore).mockRejectedValue(
      new ApiError(422, 'BUSINESS_NUMBER_FORMAT_INVALID', '사업자등록번호 형식이 올바르지 않습니다'),
    )
    const { wrapper } = setup()
    const { result } = renderHook(() => useCreateStore(), { wrapper })

    result.current.mutate({ ...input, businessNumber: '123' })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
