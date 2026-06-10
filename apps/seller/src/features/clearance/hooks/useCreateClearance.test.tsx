import type { ReactNode } from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useCreateClearance } from './useCreateClearance'
import { clearanceKeys } from './clearanceKeys'
import { productKeys } from '@/features/product/hooks/productKeys'
import { clearanceApi } from '../api/clearanceApi'
import { ApiError } from '@/shared/lib/apiError'
import type { ClearanceView } from '../types'

vi.mock('../api/clearanceApi')

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  return { queryClient, wrapper }
}

const fields = { productId: 2, salePrice: 1500, totalQty: 10, closeTime: '20:00' }

describe('useCreateClearance', () => {
  beforeEach(() => vi.clearAllMocks())

  it('등록 성공 시 storeId 와 payload 로 호출하고 떨이·상품 목록을 무효화한다', async () => {
    vi.mocked(clearanceApi.createClearance).mockResolvedValue({
      id: 1,
      soldQty: 0,
      status: 'OPEN',
      createdAt: '2026-06-01T10:00:00.000Z',
      productName: '아메리카노',
      originalPrice: 3000,
      remainingQty: 10,
      ...fields,
    } as ClearanceView)
    const { queryClient, wrapper } = setup()
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useCreateClearance(1), { wrapper })

    result.current.mutate(fields)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(clearanceApi.createClearance).toHaveBeenCalledWith(1, fields)
    expect(invalidate).toHaveBeenCalledWith({ queryKey: clearanceKeys.list(1) })
    expect(invalidate).toHaveBeenCalledWith({ queryKey: productKeys.list(1) })
  })

  it('거부(PRODUCT_ALREADY_ON_CLEARANCE) 시 에러를 노출한다', async () => {
    vi.mocked(clearanceApi.createClearance).mockRejectedValue(
      new ApiError(409, 'PRODUCT_ALREADY_ON_CLEARANCE', '이미 진행 중인 마감 할인이 있어요'),
    )
    const { wrapper } = setup()
    const { result } = renderHook(() => useCreateClearance(1), { wrapper })

    result.current.mutate(fields)

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
