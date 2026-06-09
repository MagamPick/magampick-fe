import { act, renderHook } from '@testing-library/react'
import { useOnline } from './useOnline'

describe('useOnline', () => {
  afterEach(() => {
    // 다음 테스트에 영향이 가지 않도록 온라인으로 복구
    act(() => window.dispatchEvent(new Event('online')))
  })

  it('초기값은 navigator.onLine 을 따른다', () => {
    const { result } = renderHook(() => useOnline())
    expect(result.current).toBe(navigator.onLine)
  })

  it('offline 이벤트가 오면 false 가 된다', () => {
    const { result } = renderHook(() => useOnline())
    act(() => window.dispatchEvent(new Event('offline')))
    expect(result.current).toBe(false)
  })

  it('offline 뒤 online 이벤트가 오면 다시 true 가 된다', () => {
    const { result } = renderHook(() => useOnline())
    act(() => window.dispatchEvent(new Event('offline')))
    act(() => window.dispatchEvent(new Event('online')))
    expect(result.current).toBe(true)
  })
})
