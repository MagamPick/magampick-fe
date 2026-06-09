import { useRegisterSW } from 'virtual:pwa-register/react'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'

/**
 * 새 버전(Service Worker) 대기 시 새로고침 안내 (pwa-convention §5).
 * registerType 'autoUpdate' 라 다음 방문엔 자동 교체되지만, 앱이 열린 채 배포되면 이 배너로 즉시 갱신을 유도한다.
 */
export function PwaUpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  if (!needRefresh) return null

  return (
    <div
      role="alert"
      className="fixed inset-x-0 bottom-0 z-[90] mx-auto flex max-w-md items-center gap-3 border-t bg-card px-4 py-3 shadow-lg"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.75rem)' }}
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <RefreshCw className="size-5" aria-hidden />
      </div>
      <p className="min-w-0 flex-1 text-sm font-semibold text-card-foreground">새 버전이 있어요</p>
      <Button size="sm" variant="ghost" onClick={() => setNeedRefresh(false)}>
        나중에
      </Button>
      <Button size="sm" onClick={() => void updateServiceWorker(true)}>
        새로고침
      </Button>
    </div>
  )
}
