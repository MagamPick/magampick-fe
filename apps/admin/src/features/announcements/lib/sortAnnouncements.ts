import type { AnnouncementView } from '../types'

/**
 * 공지 정렬 안전망 — 핀 고정 우선 → 발행일(date) 최신 → id 최신.
 * BE 도 핀DESC→date DESC→id DESC 로 정렬하지만, 방어적으로 재적용(seller sortNotices 패턴).
 * 원본 배열은 변형하지 않는다.
 */
export function sortAnnouncements(items: AnnouncementView[]): AnnouncementView[] {
  return [...items].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
    if (a.date !== b.date) return b.date.localeCompare(a.date)
    return b.id - a.id
  })
}
