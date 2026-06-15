import { describe, it, expect } from 'vitest'
import { announcementFormSchema, TITLE_MAX, BODY_MAX } from './announcementFormSchema'

const valid = { tag: 'notice' as const, pinned: false, title: '점검 안내', body: '내용입니다' }

describe('announcementFormSchema', () => {
  it('유효한 입력은 통과', () => {
    expect(announcementFormSchema.safeParse(valid).success).toBe(true)
  })

  it('제목이 비면 실패', () => {
    const r = announcementFormSchema.safeParse({ ...valid, title: '   ' })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.error.issues[0].message).toBe('제목을 입력해 주세요')
  })

  it(`제목이 ${TITLE_MAX}자 초과면 실패`, () => {
    const r = announcementFormSchema.safeParse({ ...valid, title: 'a'.repeat(TITLE_MAX + 1) })
    expect(r.success).toBe(false)
  })

  it(`제목이 정확히 ${TITLE_MAX}자면 통과`, () => {
    expect(announcementFormSchema.safeParse({ ...valid, title: 'a'.repeat(TITLE_MAX) }).success).toBe(
      true,
    )
  })

  it('본문이 비면 실패', () => {
    const r = announcementFormSchema.safeParse({ ...valid, body: '' })
    expect(r.success).toBe(false)
  })

  it(`본문이 ${BODY_MAX}자 초과면 실패(soft max)`, () => {
    const r = announcementFormSchema.safeParse({ ...valid, body: 'a'.repeat(BODY_MAX + 1) })
    expect(r.success).toBe(false)
  })

  it('알 수 없는 태그는 실패', () => {
    const r = announcementFormSchema.safeParse({ ...valid, tag: 'promo' })
    expect(r.success).toBe(false)
  })

  it('title 은 trim 되어 파싱된다', () => {
    const r = announcementFormSchema.safeParse({ ...valid, title: '  공지  ' })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.title).toBe('공지')
  })
})
