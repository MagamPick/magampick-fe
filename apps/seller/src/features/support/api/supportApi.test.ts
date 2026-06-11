import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/shared/lib/axios')

import { apiClient } from '@/shared/lib/axios'
import { supportApi } from './supportApi'

/** BE FaqResponse 픽스처 */
const beFaq = { id: 1, question: '정산은 언제 이루어지나요?', answer: '매월 정해진 회차에 정산됩니다.' }

/** BE InquiryResponse 픽스처 (사장 카테고리) */
const bePending = {
  id: 20,
  category: 'product',
  title: '마감 할인 수량을 수정하고 싶어요',
  content: '이미 등록한 마감 할인 상품의 남은 수량을 변경할 수 있을까요?',
  status: 'pending',
  createdAt: '2026-05-29',
  answer: null,
}
const beAnswered = {
  id: 21,
  category: 'settlement',
  title: '정산 지급일이 궁금해요',
  content: '이번 달 정산 지급일이 언제인가요?',
  status: 'answered',
  createdAt: '2026-05-22',
  answer: { content: '다음 달 10일에 지급됩니다.', answeredAt: '2026-05-23' },
}

describe('supportApi (사장)', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('listFaqs', () => {
    it('GET /seller/faqs 호출하고 Faq[] 로 매핑한다 (id number→string)', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: [beFaq] })

      const result = await supportApi.listFaqs()

      expect(apiClient.get).toHaveBeenCalledWith('/seller/faqs')
      expect(result).toEqual([
        { id: '1', question: '정산은 언제 이루어지나요?', answer: '매월 정해진 회차에 정산됩니다.' },
      ])
    })
  })

  describe('listInquiries', () => {
    it('GET /seller/inquiries 호출하고 최신순으로 매핑한다', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: [beAnswered, bePending] })

      const result = await supportApi.listInquiries()

      expect(apiClient.get).toHaveBeenCalledWith('/seller/inquiries')
      // createdAt 내림차순 — 최신(05-29)이 먼저
      expect(result.map((i) => i.id)).toEqual(['20', '21'])
      expect(result[0].answer).toBeNull()
      expect(result[1].answer).toEqual({
        content: '다음 달 10일에 지급됩니다.',
        answeredAt: '2026-05-23',
      })
    })
  })

  describe('getInquiry', () => {
    it('GET /seller/inquiries/{id} 호출하고 Inquiry 로 매핑한다', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: beAnswered })

      const result = await supportApi.getInquiry('21')

      expect(apiClient.get).toHaveBeenCalledWith('/seller/inquiries/21')
      expect(result).toMatchObject({ id: '21', category: 'settlement', status: 'answered' })
      expect(result.answer?.content).toBe('다음 달 10일에 지급됩니다.')
    })

    it('BE 가 거부하면 에러를 전파한다', async () => {
      vi.mocked(apiClient.get).mockRejectedValue(new Error('not found'))
      await expect(supportApi.getInquiry('999')).rejects.toThrow()
    })
  })

  describe('submitInquiry', () => {
    it('POST /seller/inquiries 에 {category,title,content} 보내고 매핑 결과 반환', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ data: bePending })

      const result = await supportApi.submitInquiry({
        category: 'product',
        title: '마감 할인 수량을 수정하고 싶어요',
        content: '이미 등록한 마감 할인 상품의 남은 수량을 변경할 수 있을까요?',
      })

      expect(apiClient.post).toHaveBeenCalledWith('/seller/inquiries', {
        category: 'product',
        title: '마감 할인 수량을 수정하고 싶어요',
        content: '이미 등록한 마감 할인 상품의 남은 수량을 변경할 수 있을까요?',
      })
      expect(result.status).toBe('pending')
      expect(result.answer).toBeNull()
    })

    it('제목·내용이 기준 미만이면 POST 없이 검증 에러', async () => {
      await expect(
        supportApi.submitInquiry({ category: 'etc', title: 'x', content: '짧음' }),
      ).rejects.toThrow()
      expect(apiClient.post).not.toHaveBeenCalled()
    })
  })
})
