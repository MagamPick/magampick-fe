import { useEffect, useState } from 'react'

/** beforeinstallprompt 이벤트 — 표준 lib.dom 에 없어 필요한 만큼만 선언. */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

/**
 * PWA 설치 prompt (pwa-convention §8). Android Chrome/Edge 의 beforeinstallprompt 를 가로채
 * 두었다가 사용자 액션 시점에 install() 로 띄운다. iOS Safari 는 미지원(canInstall=false).
 */
export function useInstallPrompt(): { canInstall: boolean; install: () => Promise<void> } {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    const onBeforeInstallPrompt = (e: Event) => {
      e.preventDefault() // 브라우저 기본 미니바 억제 → 노출 시점 직접 제어
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }
    const onInstalled = () => setDeferredPrompt(null)
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  return {
    canInstall: deferredPrompt !== null,
    install: async () => {
      if (!deferredPrompt) return
      await deferredPrompt.prompt()
      setDeferredPrompt(null) // prompt 는 일회용
    },
  }
}
