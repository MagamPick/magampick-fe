import { z } from 'zod'
import { apiClient } from '@/shared/lib/axios'
import { nullableString, nullableBoolean, nullableNumber } from '@/shared/lib/zodNullable'
import { sortNotices } from '../lib/sortNotices'
import { noticeTagSchema, type Notice } from '../types'

/**
 * 공지사항 API — 노션 「공지사항 조회」(Phase 11). 발행된 공지를 핀 우선·최신순 조회(읽기 전용).
 * 공지=전역 플랫폼 공지(사장+소비자 공통) → 사장 앱도 소비자와 동일한 GET /announcements 호출.
 * envelope {success,data} 는 axios 인터셉터가 자동 unwrap → data 만 도착.
 * BE 도 핀 우선·최신순 정렬하지만, 방어적으로 sortNotices 재적용.
 */

// ─── BE Zod 스키마 ────────────────────────────────────────────────────────────

/** BE AnnouncementResponse */
const announcementResponseSchema = z.object({
  id: nullableNumber(),
  tag: noticeTagSchema,
  pinned: nullableBoolean(),
  date: nullableString(),
  title: nullableString(),
  body: nullableString(),
})

type AnnouncementResponse = z.infer<typeof announcementResponseSchema>

// ─── BE → FE 도메인 매핑 ─────────────────────────────────────────────────────

/** BE AnnouncementResponse → FE Notice (id number→string · optional 기본값) */
function mapNotice(res: AnnouncementResponse): Notice {
  return {
    id: String(res.id ?? 0),
    tag: res.tag,
    pinned: res.pinned ?? false,
    date: res.date ?? '',
    title: res.title ?? '',
    body: res.body ?? '',
  }
}

// ─── noticeApi ────────────────────────────────────────────────────────────────

export const noticeApi = {
  /** 발행된 공지 — 핀 우선·최신순 정렬해 반환 */
  async listNotices(): Promise<Notice[]> {
    const { data } = await apiClient.get('/announcements')
    const mapped = z.array(announcementResponseSchema).parse(data).map(mapNotice)
    return sortNotices(mapped)
  },
}
