import { describe, it, expect } from 'vitest'
import { sortNotices } from './sortNotices'
import type { Notice } from '../types'

const n = (over: Partial<Notice>): Notice => ({
  id: 'x',
  tag: 'notice',
  pinned: false,
  date: '2026-01-01',
  title: '제목',
  body: '본문',
  ...over,
})

describe('sortNotices', () => {
  it('핀 고정 공지를 맨 위로 올린다', () => {
    const sorted = sortNotices([
      n({ id: 'a', pinned: false, date: '2026-05-30' }),
      n({ id: 'b', pinned: true, date: '2026-01-01' }),
    ])
    expect(sorted.map((x) => x.id)).toEqual(['b', 'a'])
  })

  it('같은 그룹 안에서는 최신순(date desc)으로 정렬한다', () => {
    const sorted = sortNotices([
      n({ id: 'old', date: '2026-04-01' }),
      n({ id: 'new', date: '2026-05-01' }),
    ])
    expect(sorted.map((x) => x.id)).toEqual(['new', 'old'])
  })

  it('핀 그룹·일반 그룹을 각각 최신순으로 — 핀 전체가 일반보다 위', () => {
    const sorted = sortNotices([
      n({ id: 'p-old', pinned: true, date: '2026-01-01' }),
      n({ id: 'r-new', pinned: false, date: '2026-12-01' }),
      n({ id: 'p-new', pinned: true, date: '2026-02-01' }),
    ])
    expect(sorted.map((x) => x.id)).toEqual(['p-new', 'p-old', 'r-new'])
  })

  it('원본 배열을 변형하지 않는다', () => {
    const input = [n({ id: 'a', pinned: false }), n({ id: 'b', pinned: true })]
    sortNotices(input)
    expect(input.map((x) => x.id)).toEqual(['a', 'b'])
  })
})
