import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { createQueryWrapper } from '@/shared/test/queryWrapper'
import { searchApi } from '../api/searchApi'
import { useAutocomplete } from './useAutocomplete'

vi.mock('../api/searchApi')

describe('useAutocomplete', () => {
  it('빈_입력이면_비활성', () => {
    const { result } = renderHook(() => useAutocomplete('  '), {
      wrapper: createQueryWrapper(),
    })
    expect(result.current.fetchStatus).toBe('idle')
    expect(searchApi.autocomplete).not.toHaveBeenCalled()
  })

  it('입력_있으면_제안_조회', async () => {
    vi.mocked(searchApi.autocomplete).mockResolvedValue([{ kind: 'product', text: '크루아상' }])
    const { result } = renderHook(() => useAutocomplete('크루'), {
      wrapper: createQueryWrapper(),
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([{ kind: 'product', text: '크루아상' }])
  })
})
