import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCountdown } from './useCountdown'

describe('useCountdown', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('남은시간을_MMSS로_표시하고_1초마다_감소', () => {
    const deadline = new Date(Date.now() + 90_000).toISOString() // 1:30
    const { result } = renderHook(() => useCountdown(deadline))

    expect(result.current.label).toBe('01:30')
    expect(result.current.isExpired).toBe(false)

    act(() => vi.advanceTimersByTime(1000))
    expect(result.current.label).toBe('01:29')

    act(() => vi.advanceTimersByTime(29_000))
    expect(result.current.label).toBe('01:00')
  })

  it('마감_시각_지나면_0000_그리고_isExpired_true', () => {
    const deadline = new Date(Date.now() + 2000).toISOString()
    const { result } = renderHook(() => useCountdown(deadline))

    act(() => vi.advanceTimersByTime(3000))

    expect(result.current.isExpired).toBe(true)
    expect(result.current.label).toBe('00:00')
  })
})
