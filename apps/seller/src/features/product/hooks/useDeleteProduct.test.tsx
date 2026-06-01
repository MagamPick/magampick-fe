import type { ReactNode } from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useDeleteProduct } from './useDeleteProduct'
import { productKeys } from './productKeys'
import { clearanceKeys } from '@/features/clearance/hooks/clearanceKeys'
import { productApi } from '../api/productApi'
import { clearanceApi } from '@/features/clearance/api/clearanceApi'

vi.mock('../api/productApi')
vi.mock('@/features/clearance/api/clearanceApi')

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

  it('진행 중 떨이를 먼저 자동 마감한 뒤 상품을 삭제하고 목록을 무효화한다', async () => {
    vi.mocked(clearanceApi.closeActiveByProduct).mockResolvedValue(undefined)
    vi.mocked(productApi.deleteProduct).mockResolvedValue(undefined)
    const { queryClient, wrapper } = setup()
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useDeleteProduct('p1', 's1'), { wrapper })

    result.current.mutate()

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(clearanceApi.closeActiveByProduct).toHaveBeenCalledWith('p1')
    expect(productApi.deleteProduct).toHaveBeenCalledWith('p1')
    expect(invalidate).toHaveBeenCalledWith({ queryKey: productKeys.list('s1') })
    expect(invalidate).toHaveBeenCalledWith({ queryKey: clearanceKeys.list('s1') })
  })
})
