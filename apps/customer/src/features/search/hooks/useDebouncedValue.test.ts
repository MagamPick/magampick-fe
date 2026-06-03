import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDebouncedValue } from './useDebouncedValue'

describe('useDebouncedValue', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('delay_전에는_이전값_유지', () => {
    const { result, rerender } = renderHook(({ v }) => useDebouncedValue(v, 200), {
      initialProps: { v: 'a' },
    })
    expect(result.current).toBe('a')
    rerender({ v: 'ab' })
    act(() => vi.advanceTimersByTime(199))
    expect(result.current).toBe('a')
  })

  it('delay_후_최신값_반영', () => {
    const { result, rerender } = renderHook(({ v }) => useDebouncedValue(v, 200), {
      initialProps: { v: 'a' },
    })
    rerender({ v: 'ab' })
    act(() => vi.advanceTimersByTime(200))
    expect(result.current).toBe('ab')
  })

  it('연속_변경시_마지막값만_반영', () => {
    const { result, rerender } = renderHook(({ v }) => useDebouncedValue(v, 200), {
      initialProps: { v: 'a' },
    })
    rerender({ v: 'ab' })
    act(() => vi.advanceTimersByTime(100))
    rerender({ v: 'abc' })
    act(() => vi.advanceTimersByTime(100)) // 첫 타이머는 취소됨 → 아직 'a'
    expect(result.current).toBe('a')
    act(() => vi.advanceTimersByTime(100)) // 두번째 타이머 완료
    expect(result.current).toBe('abc')
  })
})
