import { z } from 'zod'

/**
 * 공지사항 도메인 (노션 「공지사항 조회」, Phase 11).
 * 발행된 공지를 핀 우선·최신순 아코디언으로 조회(읽기 전용). 작성·발행은 관리자(별도 기능).
 * BE 실연동 — 공지 조회 GET /announcements (apiClient + Zod 응답 검증). 소비자 notices 미러.
 */

/** 태그 — 공지 / 이벤트 / 업데이트 (분류 라벨) */
export const noticeTagSchema = z.enum(['notice', 'event', 'update'])
export type NoticeTag = z.infer<typeof noticeTagSchema>

/** 태그 → 한국어 라벨 */
export const NOTICE_TAG_LABEL: Record<NoticeTag, string> = {
  notice: '공지',
  event: '이벤트',
  update: '업데이트',
}

/**
 * 태그 → 배지 색 (프로토타입 `an-item__tag--*`).
 * notice=배경/보조텍스트, event=2차(크림/주황), update=info(블루).
 */
export const NOTICE_TAG_CLASS: Record<NoticeTag, string> = {
  notice: 'bg-background text-muted-foreground',
  event: 'bg-secondary text-secondary-foreground',
  update: 'bg-info/10 text-info',
}

/** 공지 항목 */
export const noticeSchema = z.object({
  id: z.string(),
  tag: noticeTagSchema,
  /** 핀 고정 — 목록 상단 우선 노출 */
  pinned: z.boolean(),
  /** 발행일 (YYYY-MM-DD) */
  date: z.string(),
  title: z.string(),
  body: z.string(),
})
export type Notice = z.infer<typeof noticeSchema>
