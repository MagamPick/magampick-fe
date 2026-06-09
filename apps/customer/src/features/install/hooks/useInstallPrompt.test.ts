import { act, renderHook } from '@testing-library/react'
import { useInstallPrompt } from './useInstallPrompt'

function fireBeforeInstallPrompt() {
  const event = new Event('beforeinstallprompt') as Event & { prompt: () => Promise<void> }
  event.prompt = vi.fn().mockResolvedValue(undefined)
  act(() => window.dispatchEvent(event))
  return event
}

describe('useInstallPrompt', () => {
  it('초기엔 설치할 수 없다', () => {
    const { result } = renderHook(() => useInstallPrompt())
    expect(result.current.canInstall).toBe(false)
  })

  it('beforeinstallprompt 를 받으면 설치 가능 상태가 된다', () => {
    const { result } = renderHook(() => useInstallPrompt())
    fireBeforeInstallPrompt()
    expect(result.current.canInstall).toBe(true)
  })

  it('install() 은 저장된 이벤트의 prompt 를 호출하고 상태를 닫는다', async () => {
    const { result } = renderHook(() => useInstallPrompt())
    const event = fireBeforeInstallPrompt()
    await act(async () => {
      await result.current.install()
    })
    expect(event.prompt).toHaveBeenCalledOnce()
    expect(result.current.canInstall).toBe(false)
  })
})
