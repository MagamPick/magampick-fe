import { useNavigate } from 'react-router'
import { ChevronLeft } from 'lucide-react'
import { ScreenContainer } from '@/shared/components/ScreenContainer'
import { NotificationList } from '../components/NotificationList'
import { useNotifications } from '../hooks/useNotifications'
import { useMarkAllNotificationsRead } from '../hooks/useMarkAllNotificationsRead'

/**
 * 사장 알림센터 (프로토타입 51-notifications) — 백헤더 + [모두 읽음] + 시간순 단일 리스트(세그먼트 없음).
 * 홈 히어로 종에서 진입. 행 클릭 = 읽음 + 딥링크(NotificationRow).
 */
export function NotificationCenterPage() {
  const navigate = useNavigate()
  const { data: notifications, isLoading } = useNotifications()
  const markAll = useMarkAllNotificationsRead()

  return (
    <ScreenContainer variant="page">
      <header className="sticky top-0 z-10 flex h-[52px] items-center gap-1 border-b border-border bg-card px-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="뒤로 가기"
          className="flex size-10 items-center justify-center text-foreground"
        >
          <ChevronLeft className="size-[22px]" />
        </button>
        <h1 className="text-[17px] font-bold text-foreground">알림</h1>
        <button
          type="button"
          onClick={() => markAll.mutate()}
          disabled={markAll.isPending}
          className="ml-auto px-2 text-[13px] font-bold text-muted-foreground disabled:opacity-50"
        >
          모두 읽음
        </button>
      </header>

      <main className="flex-1">
        <NotificationList notifications={notifications} isLoading={isLoading} />
      </main>
    </ScreenContainer>
  )
}
