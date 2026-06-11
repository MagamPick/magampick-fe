import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/shared/lib/axios')

import { apiClient } from '@/shared/lib/axios'
import { noticeApi } from './noticeApi'

/** BE AnonouncementResponse 픽스처 (정렬 안 된 순서로 제공) */
const beAnnouncements = [
  { id: 1, tag: 'notice', pinned: false, date: '2026-05-18', title: '점검 안내', body: '점검합니다.' },
  { id: 2, tag: 'update', pinned: true, date: '2026-05-26', title: '5월 업데이트', body: '개선했어요.' },
  { id: 3, tag: 'event', pinned: true, date: '2026-05-22', title: '쿠폰 이벤트', body: '받아가세요.' },
]

describe('noticeApi (소비자)', () => {
  beforeEach(() => vi.clearAllMocks())

  it('GET /announcements 호출하고 핀 우선·최신순으로 매핑한다 (id number→string)', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: beAnnouncements })

    const list = await noticeApi.listNotices()

    expect(apiClient.get).toHaveBeenCalledWith('/announcements')
    // 핀(2:05-26, 3:05-22) 먼저 date desc, 그 뒤 일반(1)
    expect(list.map((n) => n.id)).toEqual(['2', '3', '1'])
    expect(list[0]).toMatchObject({ id: '2', tag: 'update', pinned: true })
  })

  it('optional 필드 없는 응답은 기본값으로 매핑한다', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: [{ id: 5, tag: 'notice' }] })

    const list = await noticeApi.listNotices()

    expect(list[0]).toEqual({
      id: '5',
      tag: 'notice',
      pinned: false,
      date: '',
      title: '',
      body: '',
    })
  })

  it('공지 0건이면 빈 배열', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: [] })
    await expect(noticeApi.listNotices()).resolves.toEqual([])
  })
})
