import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { readHistory } from '../lib/searchHistory'
import { useSearchHistory } from './useSearchHistory'

describe('useSearchHistory', () => {
  beforeEach(() => localStorage.clear())

  it('add_하면_history와_localStorage_갱신', () => {
    const { result } = renderHook(() => useSearchHistory(1))
    act(() => result.current.add('크루아상'))
    expect(result.current.history).toEqual(['크루아상'])
    expect(readHistory(1)).toEqual(['크루아상'])
  })

  it('같은_검색어_재검색시_맨앞으로_갱신', () => {
    const { result } = renderHook(() => useSearchHistory(1))
    act(() => result.current.add('a'))
    act(() => result.current.add('b'))
    act(() => result.current.add('a'))
    expect(result.current.history).toEqual(['a', 'b'])
  })

  it('removeOne_개별_삭제', () => {
    const { result } = renderHook(() => useSearchHistory(1))
    act(() => result.current.add('a'))
    act(() => result.current.add('b'))
    act(() => result.current.removeOne('a'))
    expect(result.current.history).toEqual(['b'])
  })

  it('clear_전체_삭제', () => {
    const { result } = renderHook(() => useSearchHistory(1))
    act(() => result.current.add('a'))
    act(() => result.current.clear())
    expect(result.current.history).toEqual([])
    expect(readHistory(1)).toEqual([])
  })

  it('계정별로_분리되어_안_섞인다', () => {
    const h1 = renderHook(() => useSearchHistory(1))
    act(() => h1.result.current.add('크루아상'))
    const h2 = renderHook(() => useSearchHistory(2))
    expect(h2.result.current.history).toEqual([])
  })
})
