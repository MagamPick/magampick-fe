import { useNavigate } from 'react-router'
import { cn } from '@/shared/lib/utils'
import { formatRelativeTime } from '../lib/formatRelativeTime'
import { useMarkNotificationRead } from '../hooks/useMarkNotificationRead'
import type { Notification } from '../types'

/**
 * 알림 1건 행 (프로토타입 `.notif-row`) — 아이콘 원형 + 제목/본문/상대시각 + 미읽음 dot.
 * 클릭 = 읽음 처리 + (link 있으면) 관련 화면 딥링크.
 */
export function NotificationRow({ notification }: { notification: Notification }) {
  const navigate = useNavigate()
  const markRead = useMarkNotificationRead()

  const handleClick = () => {
    if (!notification.read) markRead.mutate(notification.id)
    if (notification.link) navigate(notification.link)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'flex w-full items-start gap-3 px-5 py-4 text-left transition-colors active:bg-muted/60',
        !notification.read && 'bg-primary/5',
      )}
    >
      <span
        aria-hidden
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-[18px]"
      >
        {notification.icon}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-sm font-bold text-foreground">{notification.title}</span>
        <span className="line-clamp-2 text-[13px] leading-snug text-muted-foreground">
          {notification.body}
        </span>
        <span className="mt-0.5 text-[11.5px] text-muted-foreground">
          {formatRelativeTime(notification.createdAt)}
        </span>
      </span>
      {!notification.read && (
        <>
          <span className="sr-only">읽지 않음</span>
          <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" aria-hidden />
        </>
      )}
    </button>
  )
}
