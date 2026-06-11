import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/shared/lib/axios')

import { apiClient } from '@/shared/lib/axios'
import { noticeApi } from './noticeApi'

/**
 * BE AnnouncementResponse 픽스처 (정렬 안 된 순서로 제공).
 * 공지=전역 플랫폼 공지 — 사장 앱도 소비자와 동일한 GET /announcements 호출.
 */
const beAnnouncements = [
  { id: 1, tag: 'update', pinned: false, date: '2025-05-10', title: '워딩 변경', body: '통일했어요.' },
  { id: 2, tag: 'notice', pinned: true, date: '2025-05-15', title: '5월 정산 일정', body: '안내드립니다.' },
  { id: 3, tag: 'event', pinned: false, date: '2025-04-28', title: '환영 프로모션', body: '수수료 할인.' },
]

describe('noticeApi (사장)', () => {
  beforeEach(() => vi.clearAllMocks())

  it('GET /announcements 호출하고 핀 우선·최신순으로 매핑한다 (id number→string)', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: beAnnouncements })

    const list = await noticeApi.listNotices()

    expect(apiClient.get).toHaveBeenCalledWith('/announcements')
    // 핀(2:05-15) 먼저, 그 뒤 일반 date desc(1:05-10, 3:04-28)
    expect(list.map((n) => n.id)).toEqual(['2', '1', '3'])
    expect(list[0]).toMatchObject({ id: '2', tag: 'notice', pinned: true })
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
