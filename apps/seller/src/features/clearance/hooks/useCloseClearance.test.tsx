import type { ReactNode } from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useCloseClearance } from './useCloseClearance'
import { clearanceKeys } from './clearanceKeys'
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

describe('useCloseClearance', () => {
  beforeEach(() => vi.clearAllMocks())

  it('마감 성공 시 closeClearance 를 호출하고 상세·목록을 무효화한다', async () => {
    vi.mocked(clearanceApi.closeClearance).mockResolvedValue({ id: 'c1' } as ClearanceView)
    const { queryClient, wrapper } = setup()
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useCloseClearance('c1', 's1'), { wrapper })

    result.current.mutate()

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(clearanceApi.closeClearance).toHaveBeenCalledWith('c1')
    expect(invalidate).toHaveBeenCalledWith({ queryKey: clearanceKeys.detail('c1') })
    expect(invalidate).toHaveBeenCalledWith({ queryKey: clearanceKeys.list('s1') })
  })
})
