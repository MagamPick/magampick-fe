import { describe, it, expect, vi, beforeEach } from 'vitest'
import { inquiryApi } from './inquiryApi'
import { apiClient } from '@/shared/lib/axios'
import type { InquiryPage, InquiryView } from '../types'

vi.mock('@/shared/lib/axios', () => ({
  apiClient: { get: vi.fn(), post: vi.fn() },
}))

const mockApi = apiClient as unknown as {
  get: ReturnType<typeof vi.fn>
  post: ReturnType<typeof vi.fn>
}

const pending: InquiryView = {
  id: 1,
  category: 'payment',
  title: '결제가 안 돼요',
  content: '카드 결제가 실패합니다.',
  status: 'pending',
  createdAt: '2026-06-10',
  answer: null,
}

const answered: InquiryView = {
  id: 2,
  category: 'order',
  title: '주문 취소 문의',
  content: '주문을 취소하고 싶어요.',
  status: 'answered',
  createdAt: '2026-06-09',
  answer: { content: '취소 처리해 드렸습니다.', answeredAt: '2026-06-11' },
}

function page(content: InquiryView[], over: Partial<InquiryPage> = {}): InquiryPage {
  return {
    content,
    page: 0,
    size: 20,
    totalCount: content.length,
    totalPages: 1,
    hasNext: false,
    hasPrevious: false,
    ...over,
  }
}

beforeEach(() => vi.clearAllMocks())

describe('inquiryApi', () => {
  it('listInquiries — GET /admin/inquiries 에 status·category·page·size 전달 + PageResponse 파싱', async () => {
    mockApi.get.mockResolvedValue({ data: page([pending, answered]) })
    const r = await inquiryApi.listInquiries({ status: 'pending', category: 'payment', page: 2, size: 20 })
    expect(mockApi.get).toHaveBeenCalledWith('/admin/inquiries', {
      params: { status: 'pending', category: 'payment', page: 2, size: 20 },
    })
    expect(r.content).toHaveLength(2)
    expect(r.content[0].id).toBe(1)
  })

  it('listInquiries — status·category 미지정이면 undefined(전체) + page 0·size 20 기본', async () => {
    mockApi.get.mockResolvedValue({ data: page([]) })
    await inquiryApi.listInquiries({})
    expect(mockApi.get).toHaveBeenCalledWith('/admin/inquiries', {
      params: { status: undefined, category: undefined, page: 0, size: 20 },
    })
  })

  it('listInquiries — 미지 category 값도 throw 없이 파싱(관대 파싱)', async () => {
    mockApi.get.mockResolvedValue({ data: page([{ ...pending, category: 'mystery' }]) })
    const r = await inquiryApi.listInquiries({})
    expect(r.content[0].category).toBe('mystery')
  })

  it('answerInquiry — POST /admin/inquiries/{id}/answer {content}, answered 응답 파싱', async () => {
    mockApi.post.mockResolvedValue({ data: answered })
    const r = await inquiryApi.answerInquiry(2, '취소 처리해 드렸습니다.')
    expect(mockApi.post).toHaveBeenCalledWith('/admin/inquiries/2/answer', {
      content: '취소 처리해 드렸습니다.',
    })
    expect(r.status).toBe('answered')
    expect(r.answer?.content).toBe('취소 처리해 드렸습니다.')
  })
})
