import { describe, it, expect, vi, beforeEach } from 'vitest'
import { announcementApi } from './announcementApi'
import { apiClient } from '@/shared/lib/axios'
import type { AnnouncementResponse, AnnouncementMutationPayload } from '../types'

vi.mock('@/shared/lib/axios', () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))

const mockApi = apiClient as unknown as {
  get: ReturnType<typeof vi.fn>
  post: ReturnType<typeof vi.fn>
  patch: ReturnType<typeof vi.fn>
  delete: ReturnType<typeof vi.fn>
}

const sample: AnnouncementResponse = {
  id: 1,
  tag: 'notice',
  pinned: false,
  date: '2026-06-10',
  title: '점검 안내',
  body: '시스템 점검이 있습니다.',
}

const payload: AnnouncementMutationPayload = {
  tag: 'event',
  pinned: true,
  title: '여름 이벤트',
  body: '여름 이벤트 안내',
}

beforeEach(() => vi.clearAllMocks())

describe('announcementApi', () => {
  it('listAnnouncements — GET /admin/announcements 배열을 파싱', async () => {
    mockApi.get.mockResolvedValue({ data: [sample] })
    const r = await announcementApi.listAnnouncements()
    expect(mockApi.get).toHaveBeenCalledWith('/admin/announcements')
    expect(r).toHaveLength(1)
    expect(r[0].id).toBe(1)
  })

  it('listAnnouncements — 핀 우선·최신순 안전망 정렬', async () => {
    mockApi.get.mockResolvedValue({
      data: [
        { ...sample, id: 1, pinned: false, date: '2026-06-20' },
        { ...sample, id: 2, pinned: true, date: '2026-06-01' },
        { ...sample, id: 3, pinned: false, date: '2026-06-25' },
      ],
    })
    const r = await announcementApi.listAnnouncements()
    expect(r.map((x) => x.id)).toEqual([2, 3, 1])
  })

  it('createAnnouncement — POST {tag,pinned,title,body} 전송', async () => {
    mockApi.post.mockResolvedValue({ data: { ...sample, ...payload } })
    await announcementApi.createAnnouncement(payload)
    expect(mockApi.post).toHaveBeenCalledWith('/admin/announcements', {
      tag: 'event',
      pinned: true,
      title: '여름 이벤트',
      body: '여름 이벤트 안내',
    })
  })

  it('updateAnnouncement — PATCH /admin/announcements/{id}', async () => {
    mockApi.patch.mockResolvedValue({ data: { ...sample, ...payload, id: 7 } })
    const r = await announcementApi.updateAnnouncement(7, payload)
    expect(mockApi.patch).toHaveBeenCalledWith(
      '/admin/announcements/7',
      expect.objectContaining({ tag: 'event', pinned: true }),
    )
    expect(r.id).toBe(7)
  })

  it('deleteAnnouncement — DELETE /admin/announcements/{id}', async () => {
    mockApi.delete.mockResolvedValue({ status: 204 })
    await announcementApi.deleteAnnouncement(3)
    expect(mockApi.delete).toHaveBeenCalledWith('/admin/announcements/3')
  })
})
