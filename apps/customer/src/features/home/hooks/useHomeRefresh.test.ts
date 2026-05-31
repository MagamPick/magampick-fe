import { describe, it, expect, vi } from 'vitest'
import { createElement, type ReactNode } from 'react'
import { renderHook, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useHomeRefresh } from './useHomeRefresh'

describe('useHomeRefresh', () => {
  it('호출_시_home_쿼리를_무효화', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries').mockResolvedValue()
    const wrapper = ({ children }: { children: ReactNode }) =>
      createElement(QueryClientProvider, { client: queryClient }, children)

    const { result } = renderHook(() => useHomeRefresh(), { wrapper })

    await act(async () => {
      await result.current()
    })

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['home'] })
  })
})
