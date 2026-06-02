import { ApiError } from '@/shared/lib/apiError'
import { REFUND_REJECT_REASON_MAX } from '../types'
import type { RefundRequest } from '../types'

/**
 * ⚠️ Mock 스텁 — 환불 BE(refund 도메인) 미구현. in-memory 로 상태 유지.
 * 실연동 시 apiClient 호출 + Zod 응답 검증으로 교체(api-client-convention).
 * 권한(본인 소유 매장만)은 BE/연동 책임 — mock 은 단일 사장(s1) 가정.
 * 소비자앱 환불 mock 과도 분리 — BE 연동 시 통합.
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
const clone = <T>(value: T): T => structuredClone(value)

const HOUR = 60 * 60 * 1000
const DAY = 24 * HOUR

/** 데모 시드 — s1 에 대기 3건(자동승인 기한 분산) + 처리완료 2건(승인·거부 이력). */
function seed(): RefundRequest[] {
  const now = Date.now()
  return [
    {
      id: 'rf1',
      orderId: 'o_done_1',
      orderNo: '1019',
      storeId: 's1',
      customerName: '빵순이',
      items: [{ name: '버터 크루아상', quantity: 2, price: 3000 }],
      amount: 6000,
      pickupCompletedAt: new Date(now - 1 * DAY).toISOString(),
      status: 'REQUESTED',
      reason: '빵에서 상한 냄새가 나요.',
      requestedAt: new Date(now - 6 * HOUR).toISOString(),
    },
    {
      id: 'rf2',
      orderId: 'o_done_2',
      orderNo: '1012',
      storeId: 's1',
      customerName: '김모닝',
      items: [
        { name: '플레인 베이글', quantity: 1, price: 2800 },
        { name: '딸기잼', quantity: 1, price: 2700 },
      ],
      amount: 5500,
      pickupCompletedAt: new Date(now - 2 * DAY - 12 * HOUR).toISOString(),
      status: 'REQUESTED',
      reason: '주문한 것과 다른 상품을 받았어요.',
      requestedAt: new Date(now - 2 * DAY).toISOString(), // 자동승인 임박(D-1)
    },
    {
      id: 'rf3',
      orderId: 'o_done_3',
      orderNo: '1003',
      storeId: 's1',
      customerName: '단골손님',
      items: [{ name: '스콘', quantity: 2, price: 2000 }],
      amount: 4000,
      pickupCompletedAt: new Date(now - 1 * DAY - 6 * HOUR).toISOString(),
      status: 'REQUESTED',
      reason: '개수가 부족했어요.',
      requestedAt: new Date(now - 1 * DAY).toISOString(),
    },
    {
      id: 'rf4',
      orderId: 'o_done_4',
      orderNo: '0998',
      storeId: 's1',
      customerName: '해피',
      items: [{ name: '레몬 타르트', quantity: 1, price: 3800 }],
      amount: 3800,
      pickupCompletedAt: new Date(now - 5 * DAY).toISOString(),
      status: 'APPROVED',
      reason: '실수로 중복 주문했어요.',
      requestedAt: new Date(now - 4 * DAY).toISOString(),
      resolvedAt: new Date(now - 3 * DAY).toISOString(),
    },
    {
      id: 'rf5',
      orderId: 'o_done_5',
      orderNo: '0991',
      storeId: 's1',
      customerName: '라떼',
      items: [{ name: '우유 식빵', quantity: 1, price: 2750 }],
      amount: 2750,
      pickupCompletedAt: new Date(now - 6 * DAY).toISOString(),
      status: 'REJECTED',
      reason: '단순 변심이에요.',
      requestedAt: new Date(now - 5 * DAY).toISOString(),
      rejectReason: '정상적으로 수령하신 상품이라 환불이 어려워요.',
      resolvedAt: new Date(now - 4 * DAY).toISOString(),
    },
  ]
}

let refunds: RefundRequest[] = seed()

/** 테스트 전용 — 모듈 in-memory 상태 초기화 */
export function resetRefundsForTest() {
  refunds = seed()
}

/** 전이 가드 공통 — 없으면 404, REQUESTED 아니면 409. */
function findPending(id: string): RefundRequest {
  const refund = refunds.find((r) => r.id === id)
  if (!refund) throw new ApiError(404, 'REFUND_NOT_FOUND', '환불 요청을 찾을 수 없어요')
  if (refund.status !== 'REQUESTED')
    throw new ApiError(409, 'REFUND_ALREADY_RESOLVED', '이미 처리된 환불 요청이에요')
  return refund
}

export const refundApi = {
  /** 매장 환불 요청 목록 — 최신순(requestedAt desc). 본인 매장만(mock 단일 사장) */
  async listRefundRequests(storeId: string): Promise<RefundRequest[]> {
    await delay(300)
    return refunds
      .filter((r) => r.storeId === storeId)
      .sort((a, b) => (a.requestedAt < b.requestedAt ? 1 : a.requestedAt > b.requestedAt ? -1 : 0))
      .map((r) => clone(r))
  },

  /** 승인 — REQUESTED → APPROVED(전액 환불 stub). 노션 「환불 승인/거부」 */
  async approveRefund(id: string): Promise<RefundRequest> {
    await delay(400)
    const refund = findPending(id)
    refund.status = 'APPROVED'
    refund.resolvedAt = new Date().toISOString()
    return clone(refund)
  },

  /** 거부 — REQUESTED → REJECTED(거부 사유 필수, 소비자 노출). 노션 「환불 승인/거부」 */
  async rejectRefund(id: string, reason: string): Promise<RefundRequest> {
    await delay(400)
    const refund = findPending(id)
    const trimmed = reason.trim()
    if (!trimmed)
      throw new ApiError(422, 'REFUND_REJECT_REASON_REQUIRED', '거부 사유를 입력해 주세요')
    if (trimmed.length > REFUND_REJECT_REASON_MAX) {
      throw new ApiError(
        422,
        'REFUND_REJECT_REASON_TOO_LONG',
        `거부 사유는 ${REFUND_REJECT_REASON_MAX}자 이내로 입력해 주세요`,
      )
    }
    refund.status = 'REJECTED'
    refund.rejectReason = trimmed
    refund.resolvedAt = new Date().toISOString()
    return clone(refund)
  },
}
