import { describe, it, expect } from 'vitest'
import { noticeApi } from './noticeApi'

describe('noticeApi', () => {
  it('발행된 공지를 핀 우선·최신순으로 반환한다', async () => {
    const list = await noticeApi.listNotices()
    expect(list.length).toBeGreaterThan(0)

    const pinnedIdxs = list.flatMap((n, i) => (n.pinned ? [i] : []))
    const restIdxs = list.flatMap((n, i) => (!n.pinned ? [i] : []))
    // 핀 고정 전체가 일반 공지보다 앞에 온다
    expect(Math.max(...pinnedIdxs)).toBeLessThan(Math.min(...restIdxs))
    // 같은 그룹은 최신순 — 첫 항목이 가장 최신 핀 공지
    expect(list[0].date >= list[1].date).toBe(true)
  })

  it('각 공지는 Zod 스키마(tag·date 형식)를 만족한다', async () => {
    const list = await noticeApi.listNotices()
    for (const n of list) {
      expect(['notice', 'event', 'update']).toContain(n.tag)
      expect(n.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    }
  })
})
