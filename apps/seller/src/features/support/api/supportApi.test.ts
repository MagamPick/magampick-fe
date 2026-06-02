import { describe, it, expect } from 'vitest'
import { supportApi } from './supportApi'

describe('supportApi', () => {
  it('FAQ 목록을 반환한다', async () => {
    const faqs = await supportApi.listFaqs()
    expect(faqs.length).toBeGreaterThan(0)
    expect(faqs[0]).toHaveProperty('question')
    expect(faqs[0]).toHaveProperty('answer')
  })

  it('내 문의 내역을 최신순으로 반환한다', async () => {
    const list = await supportApi.listInquiries()
    expect(list.length).toBeGreaterThan(0)
    for (let i = 1; i < list.length; i++) {
      expect(list[i - 1].createdAt >= list[i].createdAt).toBe(true)
    }
  })

  it('문의를 제출하면 대기 상태로 내역 맨 앞에 추가된다', async () => {
    const before = await supportApi.listInquiries()
    const created = await supportApi.submitInquiry({
      category: 'etc',
      title: '테스트 문의 제목',
      content: '테스트 문의 내용입니다. 충분히 길게 작성했어요.',
    })
    expect(created.status).toBe('pending')
    expect(created.answer).toBeNull()

    const after = await supportApi.listInquiries()
    expect(after.length).toBe(before.length + 1)
    expect(after[0].id).toBe(created.id)
  })

  it('없는 문의를 조회하면 에러를 던진다', async () => {
    await expect(supportApi.getInquiry('does-not-exist')).rejects.toThrow()
  })

  it('제목·내용이 기준 미만이면 제출 시 검증 에러', async () => {
    await expect(
      supportApi.submitInquiry({ category: 'etc', title: 'x', content: '짧음' }),
    ).rejects.toThrow()
  })
})
