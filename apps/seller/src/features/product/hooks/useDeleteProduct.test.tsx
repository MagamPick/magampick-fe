import type { ReactNode } from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useDeleteProduct } from './useDeleteProduct'
import { productKeys } from './productKeys'
import { clearanceKeys } from '@/features/clearance/hooks/clearanceKeys'
import { productApi } from '../api/productApi'

vi.mock('../api/productApi')

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  return { queryClient, wrapper }
}

describe('useDeleteProduct', () => {
  beforeEach(() => vi.clearAllMocks())

  it('상품을 삭제하고 상품·떨이 목록을 무효화한다', async () => {
    vi.mocked(productApi.deleteProduct).mockResolvedValue(undefined)
    const { queryClient, wrapper } = setup()
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useDeleteProduct(1, 1), { wrapper })

    result.current.mutate()

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(productApi.deleteProduct).toHaveBeenCalledWith(1, 1)
    expect(invalidate).toHaveBeenCalledWith({ queryKey: productKeys.list(1) })
    expect(invalidate).toHaveBeenCalledWith({ queryKey: clearanceKeys.list(1) })
  })
})
