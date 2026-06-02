import { useState } from 'react'
import { useNavigate } from 'react-router'
import { ChevronLeft } from 'lucide-react'
import { ScreenContainer } from '@/shared/components/ScreenContainer'
import { SegTabs } from '@/shared/components/SegTabs'
import { NotificationList } from '../components/NotificationList'
import { useNotifications } from '../hooks/useNotifications'
import { useMarkAllNotificationsRead } from '../hooks/useMarkAllNotificationsRead'
import { SEGMENT_TABS } from '../constants'
import type { NotificationSegment } from '../types'

/**
 * 알림센터 (프로토타입 51-notifications) — 백헤더 + [모두 읽음] + 세그먼트(전체/마감 할인/주문) + 목록.
 * 홈 헤더 종에서 진입. 행 클릭 = 읽음 + 딥링크(NotificationRow).
 */
export function NotificationCenterPage() {
  const navigate = useNavigate()
  const [segment, setSegment] = useState<NotificationSegment>('all')
  const { data: notifications, isLoading } = useNotifications(segment)
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

      <SegTabs
        ariaLabel="알림 종류 필터"
        tabs={SEGMENT_TABS}
        value={segment}
        onChange={setSegment}
      />

      <main className="flex-1">
        <NotificationList notifications={notifications} isLoading={isLoading} />
      </main>
    </ScreenContainer>
  )
}
