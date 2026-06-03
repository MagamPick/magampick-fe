import { describe, it, expect, vi } from 'vitest'
import type { ReactNode } from 'react'
import { renderHook } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useStoreDetailRefresh } from './useStoreDetailRefresh'

describe('useStoreDetailRefresh', () => {
  it('해당_매장_쿼리_무효화_호출', async () => {
    const queryClient = new QueryClient()
    const spy = vi.spyOn(queryClient, 'invalidateQueries').mockResolvedValue()
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    const { result } = renderHook(() => useStoreDetailRefresh('st-1'), { wrapper })
    await result.current()

    expect(spy).toHaveBeenCalledWith({ queryKey: ['store', 'st-1'] })
  })
})
