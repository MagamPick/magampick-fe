import { z } from 'zod'
import { apiClient } from '@/shared/lib/axios'
import {
  inquiryCategorySchema,
  inquiryInputSchema,
  inquiryStatusSchema,
  type Faq,
  type Inquiry,
  type InquiryInput,
} from '../types'

/**
 * 고객센터 API — 노션 「문의하기」(Phase 11). FAQ 조회 + 1:1 문의 제출·내역·답변 조회.
 * BE 엔드포인트: GET /faqs · GET·POST /customers/me/inquiries · GET /customers/me/inquiries/{id}
 * envelope {success,data} 는 axios 인터셉터가 자동 unwrap → data 만 도착.
 */

// ─── BE Zod 스키마 ────────────────────────────────────────────────────────────

/** BE FaqResponse */
const faqResponseSchema = z.object({
  id: z.number().optional(),
  question: z.string().optional(),
  answer: z.string().optional(),
})

/** BE InquiryAnswerResponse */
const inquiryAnswerResponseSchema = z.object({
  content: z.string().optional(),
  answeredAt: z.string().optional(),
})

/** BE InquiryResponse — category 는 본인(소비자) 문의라 소비자 enum 범위 */
const inquiryResponseSchema = z.object({
  id: z.number().optional(),
  category: inquiryCategorySchema,
  title: z.string().optional(),
  content: z.string().optional(),
  status: inquiryStatusSchema.optional(),
  createdAt: z.string().optional(),
  answer: inquiryAnswerResponseSchema.nullish(),
})

type FaqResponse = z.infer<typeof faqResponseSchema>
type InquiryResponse = z.infer<typeof inquiryResponseSchema>

// ─── BE → FE 도메인 매핑 ─────────────────────────────────────────────────────

/** BE FaqResponse → FE Faq (id number→string) */
function mapFaq(res: FaqResponse): Faq {
  return {
    id: String(res.id ?? 0),
    question: res.question ?? '',
    answer: res.answer ?? '',
  }
}

/** BE InquiryResponse → FE Inquiry (id number→string · answer undefined→null) */
function mapInquiry(res: InquiryResponse): Inquiry {
  return {
    id: String(res.id ?? 0),
    category: res.category,
    title: res.title ?? '',
    content: res.content ?? '',
    status: res.status ?? 'pending',
    createdAt: res.createdAt ?? '',
    answer: res.answer
      ? { content: res.answer.content ?? '', answeredAt: res.answer.answeredAt ?? '' }
      : null,
  }
}

// ─── supportApi ───────────────────────────────────────────────────────────────

export const supportApi = {
  /** FAQ 목록 */
  async listFaqs(): Promise<Faq[]> {
    const { data } = await apiClient.get('/faqs')
    return z.array(faqResponseSchema).parse(data).map(mapFaq)
  },

  /** 내 문의 내역 — BE 최신순, 방어적으로 createdAt 내림차순 재정렬 */
  async listInquiries(): Promise<Inquiry[]> {
    const { data } = await apiClient.get('/customers/me/inquiries')
    return z
      .array(inquiryResponseSchema)
      .parse(data)
      .map(mapInquiry)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  },

  /** 문의 상세 (본인 문의) */
  async getInquiry(id: string): Promise<Inquiry> {
    const { data } = await apiClient.get('/customers/me/inquiries/' + id)
    return mapInquiry(inquiryResponseSchema.parse(data))
  },

  /** 1:1 문의 제출 — 입력 검증(카테고리·제목 2자↑·내용 10자↑) 후 POST */
  async submitInquiry(input: InquiryInput): Promise<Inquiry> {
    const body = inquiryInputSchema.parse(input)
    const { data } = await apiClient.post('/customers/me/inquiries', body)
    return mapInquiry(inquiryResponseSchema.parse(data))
  },
}
