import { useNavigate } from 'react-router'
import { ShoppingBag, RotateCcw, MessageSquare, Wallet, Megaphone, Bell } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { formatRelativeTime } from '../lib/formatRelativeTime'
import { useMarkNotificationRead } from '../hooks/useMarkNotificationRead'
import type { Notification } from '../types'

/**
 * 알림 1건 행 (프로토타입 51-notifications `.noti-row`) — 아이콘 + 제목/본문/상대시각 + 미읽음 dot.
 * 클릭 = 읽음 처리 + (link 있으면) 관련 화면 딥링크.
 * 아이콘은 category 값(소문자 매칭)을 lucide JSX 로 파생. 알 수 없는 category → Bell 기본.
 */

const ICON_CLASS = 'size-[18px] text-muted-foreground'

/** category → lucide JSX (컴포넌트 타입이 아닌 요소를 직접 반환해 React Compiler 경고 회피) */
function renderCategoryIcon(category: string) {
  switch (category.toLowerCase()) {
    case 'order':
      return <ShoppingBag className={ICON_CLASS} aria-hidden />
    case 'refund':
      return <RotateCcw className={ICON_CLASS} aria-hidden />
    case 'review':
      return <MessageSquare className={ICON_CLASS} aria-hidden />
    case 'settlement':
      return <Wallet className={ICON_CLASS} aria-hidden />
    case 'notice':
      return <Megaphone className={ICON_CLASS} aria-hidden />
    default:
      return <Bell className={ICON_CLASS} aria-hidden />
  }
}

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
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted"
      >
        {renderCategoryIcon(notification.category)}
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
