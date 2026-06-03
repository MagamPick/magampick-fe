import type { ReactNode } from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useUpdateClearance } from './useUpdateClearance'
import { clearanceKeys } from './clearanceKeys'
import { productKeys } from '@/features/product/hooks/productKeys'
import { clearanceApi } from '../api/clearanceApi'
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

describe('useUpdateClearance', () => {
  beforeEach(() => vi.clearAllMocks())

  it('수정 성공 시 payload 로 호출하고 상세·떨이목록·상품목록을 무효화한다', async () => {
    vi.mocked(clearanceApi.updateClearance).mockResolvedValue({ id: 'c1' } as ClearanceView)
    const { queryClient, wrapper } = setup()
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useUpdateClearance('c1', 's1'), { wrapper })

    result.current.mutate({ remainingQty: 5 })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(clearanceApi.updateClearance).toHaveBeenCalledWith('c1', { remainingQty: 5 })
    expect(invalidate).toHaveBeenCalledWith({ queryKey: clearanceKeys.detail('c1') })
    expect(invalidate).toHaveBeenCalledWith({ queryKey: clearanceKeys.list('s1') })
    expect(invalidate).toHaveBeenCalledWith({ queryKey: productKeys.list('s1') })
  })
})
