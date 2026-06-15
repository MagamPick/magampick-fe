import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/shared/lib/axios')

import { apiClient } from '@/shared/lib/axios'
import { supportApi } from './supportApi'

/** BE FaqResponse 픽스처 */
const beFaq = { id: 1, question: '픽업은 어떻게 하나요?', answer: '코드를 보여주세요.' }

/** BE InquiryResponse 픽스처 */
const bePending = {
  id: 10,
  category: 'coupon',
  title: '쿠폰이 적용되지 않아요',
  content: '결제 화면에서 쿠폰을 선택했는데 반영되지 않습니다.',
  status: 'pending',
  createdAt: '2026-05-28',
  answer: null,
}
const beAnswered = {
  id: 11,
  category: 'order',
  title: '픽업 시간을 놓쳤어요',
  content: '어제 픽업을 깜빡했어요.',
  status: 'answered',
  createdAt: '2026-05-20',
  answer: { content: '영업 중 방문하시면 받을 수 있어요.', answeredAt: '2026-05-21' },
}

describe('supportApi (소비자)', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('listFaqs', () => {
    it('GET /faqs 호출하고 Faq[] 로 매핑한다 (id number→string)', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: [beFaq] })

      const result = await supportApi.listFaqs()

      expect(apiClient.get).toHaveBeenCalledWith('/faqs')
      expect(result).toEqual([
        { id: '1', question: '픽업은 어떻게 하나요?', answer: '코드를 보여주세요.' },
      ])
    })
  })

  describe('listInquiries', () => {
    it('GET /customers/me/inquiries 호출하고 최신순으로 매핑한다', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: [beAnswered, bePending] })

      const result = await supportApi.listInquiries()

      expect(apiClient.get).toHaveBeenCalledWith('/customers/me/inquiries')
      // createdAt 내림차순 — 최신(05-28)이 먼저
      expect(result.map((i) => i.id)).toEqual(['10', '11'])
      expect(result[0].answer).toBeNull()
      expect(result[1].answer).toEqual({
        content: '영업 중 방문하시면 받을 수 있어요.',
        answeredAt: '2026-05-21',
      })
    })
  })

  describe('getInquiry', () => {
    it('GET /customers/me/inquiries/{id} 호출하고 Inquiry 로 매핑한다', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: beAnswered })

      const result = await supportApi.getInquiry('11')

      expect(apiClient.get).toHaveBeenCalledWith('/customers/me/inquiries/11')
      expect(result).toMatchObject({ id: '11', category: 'order', status: 'answered' })
      expect(result.answer?.content).toBe('영업 중 방문하시면 받을 수 있어요.')
    })

    it('BE 가 거부하면 에러를 전파한다', async () => {
      vi.mocked(apiClient.get).mockRejectedValue(new Error('not found'))
      await expect(supportApi.getInquiry('999')).rejects.toThrow()
    })
  })

  describe('submitInquiry', () => {
    it('POST /customers/me/inquiries 에 {category,title,content} 보내고 매핑 결과 반환', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ data: bePending })

      const result = await supportApi.submitInquiry({
        category: 'coupon',
        title: '쿠폰이 적용되지 않아요',
        content: '결제 화면에서 쿠폰을 선택했는데 반영되지 않습니다.',
      })

      expect(apiClient.post).toHaveBeenCalledWith('/customers/me/inquiries', {
        category: 'coupon',
        title: '쿠폰이 적용되지 않아요',
        content: '결제 화면에서 쿠폰을 선택했는데 반영되지 않습니다.',
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
