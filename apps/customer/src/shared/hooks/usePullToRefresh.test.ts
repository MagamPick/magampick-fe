import { describe, it, expect, vi } from 'vitest'
import type { TouchEvent } from 'react'
import { renderHook, act } from '@testing-library/react'
import { usePullToRefresh } from './usePullToRefresh'

const touch = (clientY: number) =>
  ({ touches: [{ clientY }] }) as unknown as TouchEvent<HTMLElement>

describe('usePullToRefresh', () => {
  it('최상단에서_임계값_이상_당기면_onRefresh_호출', async () => {
    const onRefresh = vi.fn().mockResolvedValue(undefined)
    const { result } = renderHook(() =>
      usePullToRefresh(onRefresh, { threshold: 70, isAtTop: () => true }),
    )

    act(() => result.current.handlers.onTouchStart(touch(100)))
    act(() => result.current.handlers.onTouchMove(touch(300))) // dy 200 → 거리 100 ≥ 70
    await act(async () => {
      await result.current.handlers.onTouchEnd()
    })

    expect(onRefresh).toHaveBeenCalledTimes(1)
  })

  it('임계값_미만이면_onRefresh_미호출', async () => {
    const onRefresh = vi.fn().mockResolvedValue(undefined)
    const { result } = renderHook(() =>
      usePullToRefresh(onRefresh, { threshold: 70, isAtTop: () => true }),
    )

    act(() => result.current.handlers.onTouchStart(touch(100)))
    act(() => result.current.handlers.onTouchMove(touch(160))) // dy 60 → 거리 30 < 70
    await act(async () => {
      await result.current.handlers.onTouchEnd()
    })

    expect(onRefresh).not.toHaveBeenCalled()
  })

  it('최상단이_아니면_당김_무시', async () => {
    const onRefresh = vi.fn().mockResolvedValue(undefined)
    const { result } = renderHook(() =>
      usePullToRefresh(onRefresh, { threshold: 70, isAtTop: () => false }),
    )

    act(() => result.current.handlers.onTouchStart(touch(100)))
    act(() => result.current.handlers.onTouchMove(touch(400)))
    await act(async () => {
      await result.current.handlers.onTouchEnd()
    })

    expect(onRefresh).not.toHaveBeenCalled()
  })
})
