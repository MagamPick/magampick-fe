import { NotificationRow } from './NotificationRow'
import type { Notification } from '../types'

/** 알림 목록 — 로딩 / 빈 상태 / 행 리스트 (세그먼트 없는 단일 리스트) */
export function NotificationList({
  notifications,
  isLoading,
}: {
  notifications: Notification[] | undefined
  isLoading: boolean
}) {
  if (isLoading) {
    return <p className="py-16 text-center text-sm text-muted-foreground">불러오는 중…</p>
  }
  if (!notifications || notifications.length === 0) {
    return (
      <div className="px-5 py-14 text-center">
        <div className="text-[44px]" aria-hidden>
          🔕
        </div>
        <p className="mt-3 text-sm font-semibold text-muted-foreground">새 알림이 없어요</p>
      </div>
    )
  }
  return (
    <ul className="divide-y divide-border">
      {notifications.map((n) => (
        <li key={n.id}>
          <NotificationRow notification={n} />
        </li>
      ))}
    </ul>
  )
}
