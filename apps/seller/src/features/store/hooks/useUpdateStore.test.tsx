import type { ReactNode } from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useUpdateStore } from './useUpdateStore'
import { storeKeys } from './storeKeys'
import { storeApi } from '../api/storeApi'
import type { StoreDetail, UpdateStoreInput } from '../types'

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

const input: UpdateStoreInput = {
  storeId: 's1',
  storeName: '마감픽 베이커리 역삼본점',
  storeAddress: '서울 강남구 테헤란로 152',
  storeAddressDetail: '2층',
  storePhone: '02-9999-0000',
  photoAdded: true,
}

const updated: StoreDetail = {
  id: 's1',
  storeName: input.storeName,
  storeAddress: input.storeAddress,
  storeAddressDetail: input.storeAddressDetail,
  storePhone: input.storePhone,
  photoAdded: true,
}

describe('useUpdateStore', () => {
  beforeEach(() => vi.clearAllMocks())

  it('수정 성공 시 updateStore 호출 + 보유 매장 목록·해당 매장 상세를 무효화한다', async () => {
    vi.mocked(storeApi.updateStore).mockResolvedValue(updated)
    const { queryClient, wrapper } = setup()
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useUpdateStore(), { wrapper })

    result.current.mutate(input)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(storeApi.updateStore).toHaveBeenCalledWith(input)
    expect(invalidate).toHaveBeenCalledWith({ queryKey: storeKeys.list() })
    expect(invalidate).toHaveBeenCalledWith({ queryKey: storeKeys.detail('s1') })
    expect(result.current.data).toEqual(updated)
  })
})
