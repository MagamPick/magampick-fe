import { useState } from 'react'
import { Download, X } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { useInstallPrompt } from '../hooks/useInstallPrompt'

/**
 * "홈 화면에 추가" 설치 안내 배너 (pwa-convention §8). 설치 가능(beforeinstallprompt 수신) 시 하단 카드 노출.
 * iOS Safari 는 beforeinstallprompt 미지원이라 노출되지 않음(공유→홈 화면 추가 안내는 별도 과제).
 */
export function InstallPrompt() {
  const { canInstall, install } = useInstallPrompt()
  const [dismissed, setDismissed] = useState(false)

  if (!canInstall || dismissed) return null

  return (
    <div
      role="dialog"
      aria-label="앱 설치 안내"
      className="fixed inset-x-0 bottom-0 z-[80] mx-auto flex max-w-md items-center gap-3 border-t bg-card px-4 py-3 shadow-lg"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.75rem)' }}
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Download className="size-5" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-card-foreground">홈 화면에 마감픽 추가</p>
        <p className="truncate text-xs text-muted-foreground">앱처럼 빠르게 열어보세요</p>
      </div>
      <Button size="sm" onClick={() => void install()}>
        설치
      </Button>
      <button
        type="button"
        aria-label="닫기"
        onClick={() => setDismissed(true)}
        className="text-muted-foreground"
      >
        <X className="size-5" aria-hidden />
      </button>
    </div>
  )
}
