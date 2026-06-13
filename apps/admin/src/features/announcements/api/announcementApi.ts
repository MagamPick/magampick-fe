/**
 * 공지(announcements) 도메인 API — 실연동. AdminAnnouncementController.
 * 참조 패턴: admin eventApi (apiClient + Zod 응답 검증).
 * 에러 정규화·envelope unwrap 은 apiClient interceptor 처리.
 * 생성/수정 본문 동일(이벤트의 value↔discountValue 같은 필드명 불일치 없음).
 */
import { z } from 'zod'
import { apiClient } from '@/shared/lib/axios'
import { sortAnnouncements } from '../lib/sortAnnouncements'
import { announcementResponseSchema } from '../types'
import type {
  AnnouncementCreatePayload,
  AnnouncementUpdatePayload,
  AnnouncementView,
} from '../types'

const announcementListSchema = z.array(announcementResponseSchema)

export const announcementApi = {
  /** GET /admin/announcements → AnnouncementResponse[] (핀DESC→date DESC→id DESC, 안전망 재정렬) */
  async listAnnouncements(): Promise<AnnouncementView[]> {
    const res = await apiClient.get('/admin/announcements')
    return sortAnnouncements(announcementListSchema.parse(res.data))
  },

  /** POST /admin/announcements → AnnouncementResponse. 생성 시 BE 가 date=오늘 자동. */
  async createAnnouncement(payload: AnnouncementCreatePayload): Promise<AnnouncementView> {
    const res = await apiClient.post('/admin/announcements', {
      tag: payload.tag,
      pinned: payload.pinned,
      title: payload.title,
      body: payload.body,
    })
    return announcementResponseSchema.parse(res.data)
  },

  /** PATCH /admin/announcements/{id} → AnnouncementResponse. 폼 전체 전송(부분수정 허용). */
  async updateAnnouncement(
    id: number,
    payload: AnnouncementUpdatePayload,
  ): Promise<AnnouncementView> {
    const res = await apiClient.patch(`/admin/announcements/${id}`, {
      tag: payload.tag,
      pinned: payload.pinned,
      title: payload.title,
      body: payload.body,
    })
    return announcementResponseSchema.parse(res.data)
  },

  /** DELETE /admin/announcements/{id} → 204. 소비자 노출에서도 제거. */
  async deleteAnnouncement(id: number): Promise<void> {
    await apiClient.delete(`/admin/announcements/${id}`)
  },
}
