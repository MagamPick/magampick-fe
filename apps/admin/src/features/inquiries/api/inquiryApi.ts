/**
 * 문의(고객 1:1) 도메인 API — 실연동. AdminInquiryController.
 * 참조 패턴: events eventApi (apiClient + Zod 응답 검증).
 * 에러 정규화 / envelope unwrap 은 apiClient interceptor 가 처리.
 */
import { apiClient } from '@/shared/lib/axios'
import { inquiryPageSchema, inquiryResponseSchema } from '../types'
import type { InquiryListParams, InquiryPage, InquiryView } from '../types'

const DEFAULT_PAGE_SIZE = 20

export const inquiryApi = {
  /**
   * GET /admin/inquiries?status=&category=&page=&size= → PageResponse<InquiryResponse>.
   * status·category 미지정(undefined)이면 axios 가 쿼리에서 생략 → 전체. 정렬은 BE(PENDING 우선 → createdAt DESC).
   */
  async listInquiries({
    status,
    category,
    page = 0,
    size = DEFAULT_PAGE_SIZE,
  }: InquiryListParams): Promise<InquiryPage> {
    const res = await apiClient.get('/admin/inquiries', {
      params: { status, category, page, size },
    })
    return inquiryPageSchema.parse(res.data)
  },

  /**
   * POST /admin/inquiries/{inquiryId}/answer {content} → 200 InquiryResponse(status=answered).
   * 404=문의 없음 / 409=이미 답변 → apiClient interceptor 가 ApiError 로 정규화(호출 측에서 처리).
   */
  async answerInquiry(id: number, content: string): Promise<InquiryView> {
    const res = await apiClient.post(`/admin/inquiries/${id}/answer`, { content })
    return inquiryResponseSchema.parse(res.data)
  },
}
