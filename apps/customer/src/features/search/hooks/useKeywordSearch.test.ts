import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { createQueryWrapper } from '@/shared/test/queryWrapper'
import { searchApi } from '../api/searchApi'
import { useKeywordSearch } from './useKeywordSearch'

vi.mock('../api/searchApi')

describe('useKeywordSearch', () => {
  it('빈_검색어면_비활성_fetch안함', () => {
    const { result } = renderHook(() => useKeywordSearch('', 'recommended'), {
      wrapper: createQueryWrapper(),
    })
    expect(result.current.fetchStatus).toBe('idle')
    expect(searchApi.search).not.toHaveBeenCalled()
  })

  it('검색어_있으면_정렬과_함께_조회', async () => {
    vi.mocked(searchApi.search).mockResolvedValue({ stores: [], products: [] })
    const { result } = renderHook(() => useKeywordSearch('빵', 'distance'), {
      wrapper: createQueryWrapper(),
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(searchApi.search).toHaveBeenCalledWith({ q: '빵', sort: 'distance' })
  })
})
