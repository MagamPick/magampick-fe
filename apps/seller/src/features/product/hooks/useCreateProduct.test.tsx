import type { ReactNode } from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useCreateProduct } from './useCreateProduct'
import { productKeys } from './productKeys'
import { productApi } from '../api/productApi'
import { ApiError } from '@/shared/lib/apiError'
import type { Product } from '../types'

vi.mock('../api/productApi')

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

const fields = { name: '녹차 라떼', category: '음료' as const, price: 5000, onSale: true }

describe('useCreateProduct', () => {
  beforeEach(() => vi.clearAllMocks())

  it('등록 성공 시 현재 매장 storeId 를 붙여 호출하고 상품 목록을 무효화한다', async () => {
    const created: Product = { id: 'p9', storeId: 's1', ...fields }
    vi.mocked(productApi.createProduct).mockResolvedValue(created)
    const { queryClient, wrapper } = setup()
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useCreateProduct('s1'), { wrapper })

    result.current.mutate(fields)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(productApi.createProduct).toHaveBeenCalledWith({ ...fields, storeId: 's1' })
    expect(invalidate).toHaveBeenCalledWith({ queryKey: productKeys.list('s1') })
  })

  it('거부(PRODUCT_INVALID_PRICE) 시 에러를 노출한다', async () => {
    vi.mocked(productApi.createProduct).mockRejectedValue(
      new ApiError(422, 'PRODUCT_INVALID_PRICE', '정상가는 0 이상의 정수여야 해요'),
    )
    const { wrapper } = setup()
    const { result } = renderHook(() => useCreateProduct('s1'), { wrapper })

    result.current.mutate({ ...fields, price: -1 })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
