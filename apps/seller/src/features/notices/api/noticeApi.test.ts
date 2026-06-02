import { describe, it, expect } from 'vitest'
import { noticeApi } from './noticeApi'

describe('noticeApi', () => {
  it('발행된 공지를 핀 우선·최신순으로 반환한다', async () => {
    const list = await noticeApi.listNotices()
    expect(list.length).toBeGreaterThan(0)

    const pinnedIdxs = list.flatMap((n, i) => (n.pinned ? [i] : []))
    const restIdxs = list.flatMap((n, i) => (!n.pinned ? [i] : []))
    expect(Math.max(...pinnedIdxs)).toBeLessThan(Math.min(...restIdxs))
    expect(list[0].pinned).toBe(true)
  })

  it('각 공지는 Zod 스키마(tag·date 형식)를 만족한다', async () => {
    const list = await noticeApi.listNotices()
    for (const n of list) {
      expect(['notice', 'event', 'update']).toContain(n.tag)
      expect(n.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    }
  })
})
