import { z } from 'zod'

/**
 * 공지(announcements) 도메인 — admin 작성/관리 (AdminAnnouncementController).
 * 발행된 공지는 소비자/사장 앱의 GET /announcements 에 노출. 태그 매핑은 seller notices 미러.
 */

// ─── 태그 (NoticeTag, 소문자 직렬화) ─────────────────────────────────────────
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
 * 태그 → 배지 색 (seller notices 미러, 프로토타입 `an-item__tag--*`).
 * notice=배경/보조텍스트, event=2차(크림/주황), update=info(블루).
 */
export const NOTICE_TAG_CLASS: Record<NoticeTag, string> = {
  notice: 'bg-background text-muted-foreground',
  event: 'bg-secondary text-secondary-foreground',
  update: 'bg-info/10 text-info',
}

// ─── BE 응답 (AnnouncementResponse) ─────────────────────────────────────────
/**
 * 손작성 Zod (api-types 에 admin 그룹 없음).
 * BE 계약상 전 필드 항상 채워짐(admin 자체 CRUD) → strict(nullable 없음). events 패턴.
 */
export const announcementResponseSchema = z.object({
  id: z.number(),
  tag: noticeTagSchema,
  pinned: z.boolean(),
  date: z.string(), // yyyy-MM-dd (=publishedAt)
  title: z.string(),
  body: z.string(),
})
export type AnnouncementResponse = z.infer<typeof announcementResponseSchema>

/** FE 도메인 — 응답과 1:1 (매핑 항등) */
export type AnnouncementView = AnnouncementResponse

// ─── 생성/수정 payload (FE 도메인) ──────────────────────────────────────────
/** 폼 → api 계층으로 넘기는 정규화 payload. 생성/수정 본문 동일(이벤트와 달리 필드명 불일치 없음). */
export interface AnnouncementMutationPayload {
  tag: NoticeTag
  pinned: boolean
  title: string
  body: string
}
export type AnnouncementCreatePayload = AnnouncementMutationPayload
export type AnnouncementUpdatePayload = AnnouncementMutationPayload
