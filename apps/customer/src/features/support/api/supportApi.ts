import { todayYmd } from '@/shared/lib/date'
import {
  faqSchema,
  inquiryInputSchema,
  inquirySchema,
  type Faq,
  type Inquiry,
  type InquiryInput,
} from '../types'

/**
 * ⚠️ Mock 스텁 — support BE 미구현. in-memory FAQ + 내 문의 내역 (couponApi 패턴: 배열 + delay + Zod).
 * FAQ = 정적 seed. 문의 제출 = 대기 상태로 내역에 추가(unshift). 답변 작성은 관리자(별도) — seed 로 1건 답변완료 표현.
 */
const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

const FAQS: Faq[] = [
  {
    id: 'faq1',
    question: '픽업은 어떻게 하나요?',
    answer: '결제 완료 후 받은 4자리 픽업 코드를 매장 직원에게 보여주시면 바로 받을 수 있어요.',
  },
  {
    id: 'faq2',
    question: '픽업 시간을 지나치면 어떻게 되나요?',
    answer:
      '픽업 시간이 지나도 주문과 픽업 코드는 그대로 유지돼요. 매장 영업 중에 방문해 코드를 보여주시면 받을 수 있어요. 다만 끝내 찾아가지 못한 주문은 환불이 제한될 수 있으니, 픽업이 어려우면 미리 매장에 연락해 주세요.',
  },
  {
    id: 'faq3',
    question: '쿠폰은 어떻게 사용하나요?',
    answer:
      '결제 페이지의 "혜택 적용 — 쿠폰" 항목에서 보유한 쿠폰 중 하나를 선택할 수 있어요. 최소 결제 금액 5,000원 이상부터 사용 가능합니다.',
  },
  {
    id: 'faq4',
    question: '포인트는 어떻게 적립되나요?',
    answer:
      '결제 시 결제 금액의 1~3%가 자동 적립되며, 리뷰 작성 시 추가 보너스가 지급돼요. 1P = 1원으로 결제 시 사용할 수 있어요.',
  },
  {
    id: 'faq5',
    question: '환불이 가능한가요?',
    answer:
      '픽업 전이라면 매장에 직접 연락해 환불 가능 여부를 확인해 주세요. 매장마다 정책이 다를 수 있습니다.',
  },
  {
    id: 'faq6',
    question: '단골 매장은 어떻게 등록하나요?',
    answer:
      '매장 상세 화면 우상단의 ♡ 아이콘을 누르면 단골 가게로 등록되며, 새 마감 할인 알림을 우선적으로 받을 수 있어요.',
  },
].map((f) => faqSchema.parse(f))

let inquirySeq = 0

const INQUIRIES: Inquiry[] = [
  {
    id: 'iq_seed_1',
    category: 'order',
    title: '픽업 시간을 놓쳤어요',
    content: '어제 저녁 픽업 예약을 깜빡하고 매장에 가지 못했어요. 지금이라도 받을 수 있을까요?',
    status: 'answered',
    createdAt: '2026-05-20',
    answer: {
      content:
        '픽업 시간이 지나도 주문과 픽업 코드는 유지돼요. 매장 영업 중에 방문해 코드를 보여주시면 받을 수 있습니다. 다만 끝내 찾아가지 못한 주문은 환불이 제한될 수 있으니, 방문이 어려우면 매장에 미리 연락 부탁드려요.',
      answeredAt: '2026-05-21',
    },
  },
  {
    id: 'iq_seed_2',
    category: 'coupon',
    title: '쿠폰이 적용되지 않아요',
    content: '결제 화면에서 보유한 쿠폰을 선택했는데 할인 금액이 반영되지 않습니다. 확인 부탁드려요.',
    status: 'pending',
    createdAt: '2026-05-28',
    answer: null,
  },
].map((i) => inquirySchema.parse(i))

export const supportApi = {
  /** FAQ 목록 */
  async listFaqs(): Promise<Faq[]> {
    await delay(200)
    return FAQS.map((f) => ({ ...f }))
  },

  /** 내 문의 내역 (최신순) */
  async listInquiries(): Promise<Inquiry[]> {
    await delay(250)
    return [...INQUIRIES]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((i) => ({ ...i }))
  },

  /** 문의 상세 (본인 문의) */
  async getInquiry(id: string): Promise<Inquiry> {
    await delay(200)
    const found = INQUIRIES.find((i) => i.id === id)
    if (!found) throw new Error('문의를 찾을 수 없어요.')
    return { ...found }
  },

  /** 1:1 문의 제출 — 대기 상태로 내역 맨 앞에 추가 */
  async submitInquiry(input: InquiryInput): Promise<Inquiry> {
    await delay(300)
    const parsed = inquiryInputSchema.parse(input)
    const inquiry = inquirySchema.parse({
      id: `iq_${++inquirySeq}_${Date.now()}`,
      category: parsed.category,
      title: parsed.title,
      content: parsed.content,
      status: 'pending',
      createdAt: todayYmd(),
      answer: null,
    })
    INQUIRIES.unshift(inquiry)
    return { ...inquiry }
  },
}
