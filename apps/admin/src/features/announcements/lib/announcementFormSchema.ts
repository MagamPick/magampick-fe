import { z } from 'zod'
import { noticeTagSchema } from '../types'

/** 본문 soft max — BE 무제한이나 과도입력 방지용 FE 차단(설계 §2-3) */
export const BODY_MAX = 5000
/** 제목 max — BE NotBlank·≤200 */
export const TITLE_MAX = 200

/**
 * 공지 생성/수정 폼 입력 스키마.
 * tag(enum) · pinned(boolean) · title(NotBlank·≤200) · body(NotBlank·soft ≤5000).
 * 교차검증 없음 → refine 불필요(설계 §5-9 트랩 무관).
 */
export const announcementFormSchema = z.object({
  tag: noticeTagSchema,
  pinned: z.boolean(),
  title: z
    .string()
    .trim()
    .min(1, '제목을 입력해 주세요')
    .max(TITLE_MAX, `제목은 ${TITLE_MAX}자 이내로 입력해 주세요`),
  body: z
    .string()
    .trim()
    .min(1, '내용을 입력해 주세요')
    .max(BODY_MAX, `내용은 ${BODY_MAX}자 이내로 입력해 주세요`),
})

export type AnnouncementFormValues = z.infer<typeof announcementFormSchema>
