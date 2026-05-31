import { describe, it, expect, vi } from 'vitest'
import type { ReactNode } from 'react'
import { renderHook } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useStoreListRefresh } from './useStoreListRefresh'

describe('useStoreListRefresh', () => {
  it('전체매장_목록_쿼리를_무효화한다', async () => {
    const queryClient = new QueryClient()
    const spy = vi.spyOn(queryClient, 'invalidateQueries')
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    const { result } = renderHook(() => useStoreListRefresh(), { wrapper })
    await result.current()

    expect(spy).toHaveBeenCalledWith({ queryKey: ['stores', 'list'] })
  })
})
