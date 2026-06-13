import { describe, it, expect } from 'vitest'
import { sortAnnouncements } from './sortAnnouncements'
import type { AnnouncementView } from '../types'

function make(over: Partial<AnnouncementView>): AnnouncementView {
  return { id: 1, tag: 'notice', pinned: false, date: '2026-06-01', title: 't', body: 'b', ...over }
}

describe('sortAnnouncements', () => {
  it('핀 공지를 비핀보다 앞에 둔다', () => {
    const r = sortAnnouncements([
      make({ id: 1, pinned: false, date: '2026-06-10' }),
      make({ id: 2, pinned: true, date: '2026-06-01' }),
    ])
    expect(r.map((x) => x.id)).toEqual([2, 1])
  })

  it('같은 핀 그룹은 발행일 최신순(date desc)', () => {
    const r = sortAnnouncements([
      make({ id: 1, date: '2026-06-01' }),
      make({ id: 2, date: '2026-06-20' }),
      make({ id: 3, date: '2026-06-10' }),
    ])
    expect(r.map((x) => x.id)).toEqual([2, 3, 1])
  })

  it('같은 핀·같은 날짜는 id 최신순(id desc)', () => {
    const r = sortAnnouncements([
      make({ id: 5, date: '2026-06-10' }),
      make({ id: 9, date: '2026-06-10' }),
      make({ id: 7, date: '2026-06-10' }),
    ])
    expect(r.map((x) => x.id)).toEqual([9, 7, 5])
  })

  it('원본 배열을 변형하지 않는다', () => {
    const input = [make({ id: 1, pinned: false }), make({ id: 2, pinned: true })]
    const snapshot = input.map((x) => x.id)
    sortAnnouncements(input)
    expect(input.map((x) => x.id)).toEqual(snapshot)
  })
})
