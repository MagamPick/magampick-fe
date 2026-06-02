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
 * FAQ = 정적 seed(사장 맥락). 문의 제출 = 대기 상태로 내역에 추가(unshift). 답변은 관리자(별도) — seed 1건.
 */
const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

/** 오늘 YYYY-MM-DD (사장 앱엔 공용 date 유틸 없음 → 인라인) */
function todayYmd(): string {
  const d = new Date()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

const FAQS: Faq[] = [
  {
    id: 'faq1',
    question: '정산은 언제 이루어지나요?',
    answer:
      '매출 정산은 매월 정해진 회차에 일괄 진행되며, 정산 내역은 마이 > 정산 내역에서 확인할 수 있어요. 정산 계좌는 매장 정보 수정에서 변경할 수 있습니다.',
  },
  {
    id: 'faq2',
    question: '마감 할인 상품은 어떻게 등록하나요?',
    answer:
      '홈 또는 상품 화면에서 [마감 할인 등록]을 눌러 정가·할인가·마감 시각·수량을 입력하면 등록돼요. 등록 즉시 고객 앱에 노출됩니다.',
  },
  {
    id: 'faq3',
    question: '수수료는 어떻게 부과되나요?',
    answer:
      '결제 완료된 주문 금액에 한해 수수료가 부과되며, 정산 시 자동 차감됩니다. 자세한 요율은 마이 > 정산 내역의 수수료 안내를 참고해 주세요.',
  },
  {
    id: 'faq4',
    question: '주문을 거절할 수 있나요?',
    answer:
      '재고 소진 등 부득이한 경우 주문 상세에서 거절 사유를 선택해 거절할 수 있어요. 거절 시 고객에게 자동 안내되고 결제 금액은 환불됩니다.',
  },
  {
    id: 'faq5',
    question: '영업시간·임시 휴무는 어디서 설정하나요?',
    answer:
      '마이 > 매장 관리 > 영업시간에서 요일별 영업시간과 임시 휴무를 설정할 수 있어요. 휴무로 설정하면 해당 기간 동안 고객 노출이 중단됩니다.',
  },
  {
    id: 'faq6',
    question: '리뷰에 답글을 달 수 있나요?',
    answer:
      '마이 > 리뷰 관리에서 고객 리뷰를 확인하고 답글을 작성할 수 있어요. 정성스러운 답글은 매장 신뢰도를 높여줍니다.',
  },
].map((f) => faqSchema.parse(f))

let inquirySeq = 0

const INQUIRIES: Inquiry[] = [
  {
    id: 'iq_seed_1',
    category: 'settlement',
    title: '정산 지급일이 궁금해요',
    content: '이번 달 정산 지급일이 언제인지, 세금계산서는 언제 발행되는지 알고 싶어요.',
    status: 'answered',
    createdAt: '2026-05-22',
    answer: {
      content:
        '이번 달 정산은 다음 달 10일에 지급되며, 세금계산서는 지급일 직전 영업일에 발행됩니다. 자세한 일정은 공지사항의 정산 일정 안내를 참고해 주세요.',
      answeredAt: '2026-05-23',
    },
  },
  {
    id: 'iq_seed_2',
    category: 'product',
    title: '마감 할인 수량을 수정하고 싶어요',
    content: '이미 등록한 마감 할인 상품의 남은 수량을 변경할 수 있을까요? 방법을 알려주세요.',
    status: 'pending',
    createdAt: '2026-05-29',
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
