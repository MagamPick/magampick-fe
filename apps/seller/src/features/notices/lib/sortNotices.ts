import type { Notice } from '../types'

/**
 * 공지 정렬 — 핀 고정 우선 → 그 외, 각 그룹 최신순(date desc).
 * 노션 「공지사항 조회」 정렬 규칙. 원본 배열은 변형하지 않는다.
 */
export function sortNotices(notices: Notice[]): Notice[] {
  return [...notices].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
    return b.date.localeCompare(a.date)
  })
}
