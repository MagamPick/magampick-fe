import { WifiOff } from 'lucide-react'
import { useOnline } from '../hooks/useOnline'

/**
 * 오프라인 안내 배너 (pwa-convention §6). 네트워크 끊김 시 상단 고정 노출.
 * 읽기 화면은 캐시 데이터로 동작하므로 차단하지 않고 배너만 보여준다.
 */
export function OfflineBanner() {
  const isOnline = useOnline()
  if (isOnline) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 top-0 z-[80] flex items-center justify-center gap-2 bg-foreground/90 px-4 py-2 text-center text-[13px] font-semibold text-white"
      style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.5rem)' }}
    >
      <WifiOff className="size-4" aria-hidden />
      오프라인 상태예요 — 일부 정보가 최신이 아닐 수 있어요
    </div>
  )
}
