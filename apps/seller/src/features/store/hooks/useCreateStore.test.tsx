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
  businessNumber: '123-45-67890',
  representativeName: '김사장',
  openDate: '2020-03-02',
  name: '마감픽 베이커리 신촌점',
  roadAddress: '서울 마포구 신촌로 123',
  detailAddress: '1층',
  zonecode: '04101',
  phone: '02-1234-5678',
  sigunguCode: '11440',
  roadnameCode: '1234567',
}

describe('useCreateStore', () => {
  beforeEach(() => vi.clearAllMocks())

  it('등록 성공 시 createStore 를 호출하고 보유 매장 목록을 무효화한다', async () => {
    const created: StoreSummary = { id: 3, name: input.name, operationStatus: 'CLOSED_TODAY' }
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
      new ApiError(400, 'BUSINESS_NUMBER_FORMAT_INVALID', '사업자등록번호 형식이 올바르지 않습니다'),
    )
    const { wrapper } = setup()
    const { result } = renderHook(() => useCreateStore(), { wrapper })

    result.current.mutate({ ...input, businessNumber: '123' })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })

  it('GEOCODING_FAILED 에러 시 isError 가 true', async () => {
    vi.mocked(storeApi.createStore).mockRejectedValue(
      new ApiError(400, 'GEOCODING_FAILED', '주소 지오코딩에 실패했습니다'),
    )
    const { wrapper } = setup()
    const { result } = renderHook(() => useCreateStore(), { wrapper })

    result.current.mutate(input)

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
