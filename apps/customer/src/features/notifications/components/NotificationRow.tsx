import { useNavigate } from 'react-router'
import {
  Flame,
  ShoppingBag,
  MessageSquare,
  Gift,
  Megaphone,
  RotateCcw,
  Wallet,
  MessageCircle,
  Bell,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { formatRelativeTime } from '../lib/formatRelativeTime'
import { useMarkNotificationRead } from '../hooks/useMarkNotificationRead'
import { resolveNotificationLink } from '../lib/resolveNotificationLink'
import type { Notification } from '../types'

/**
 * 알림 1건 행 (프로토타입 `.notif-row`) — 아이콘 원형 + 제목/본문/상대시각 + 미읽음 dot.
 * 클릭 = 읽음 처리 + 하이브리드 라우팅 (BE link 우선 → category fallback, [[resolveNotificationLink]]).
 * icon 필드는 BE 응답에 없음 — category 로 파생.
 */

const ICON_CLASS = 'size-[18px] text-muted-foreground'

function renderCategoryIcon(category: string) {
  switch (category.toLowerCase()) {
    case 'deal':
      return <Flame className={ICON_CLASS} aria-hidden />
    case 'order':
      return <ShoppingBag className={ICON_CLASS} aria-hidden />
    case 'review':
      return <MessageSquare className={ICON_CLASS} aria-hidden />
    case 'benefit':
      return <Gift className={ICON_CLASS} aria-hidden />
    case 'system':
    case 'notice':
      return <Megaphone className={ICON_CLASS} aria-hidden />
    case 'refund':
      return <RotateCcw className={ICON_CLASS} aria-hidden />
    case 'settlement':
      return <Wallet className={ICON_CLASS} aria-hidden />
    case 'inquiry':
      return <MessageCircle className={ICON_CLASS} aria-hidden />
    default:
      return <Bell className={ICON_CLASS} aria-hidden />
  }
}

export function NotificationRow({ notification }: { notification: Notification }) {
  const navigate = useNavigate()
  const markRead = useMarkNotificationRead()

  const handleClick = () => {
    if (!notification.read) markRead.mutate(notification.id)
    const route = resolveNotificationLink(notification)
    if (route) navigate(route)
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
