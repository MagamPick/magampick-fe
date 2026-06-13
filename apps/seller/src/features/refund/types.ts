/**
 * 환불 도메인 타입 (노션 「환불 승인/거부」, Phase 6) — 사장 환불 요청 inbox.
 * 환불 요청 = 픽업 완료(주문) 위에 얹힌 별도 라이프사이클. 주문 7-상태 머신과 분리.
 * BE refund 도메인 실연동 — apiClient + Zod 응답 검증(refundApi). 이 파일은 BE 응답이 매핑되는 화면용 도메인 모델.
 */

/** 사장 처리 기한 — 요청 후 N일 미처리 시 자동 승인(노션). FE 는 표시만, 타이머 실행 X */
export const REFUND_AUTO_APPROVE_DAYS = 3
/** 거부 사유 최대 길이 (노션 미명시 — 합리적 기본값) */
export const REFUND_REJECT_REASON_MAX = 200

/** 환불 상태 — 요청됨(승인 대기) / 승인(전액 환불 완료) / 거부됨 */
export type RefundStatus = 'REQUESTED' | 'APPROVED' | 'REJECTED'

/** 환불 요청 안의 주문 상품 요약 — `price` = 단가(KRW) */
export interface RefundRequestItem {
  name: string
  quantity: number
  price: number
}

/**
 * 환불 요청 — 주문 요약 + 환불 상세 (BE 응답 매핑 도메인 모델).
 * 권한(본인 소유 매장만)은 BE 책임.
 */
export interface RefundRequest {
  /** 환불 요청 id */
  id: string
  orderId: string
  /** 표시용 주문 번호 (예: "1019") */
  orderNo: string
  storeId: string
  /** 고객 닉네임 */
  customerName: string
  items: RefundRequestItem[]
  /** 환불 예정/완료 금액 (전액 — 노션: 부분 환불 없음) */
  amount: number
  /** 픽업 완료 시각 (ISO) */
  pickupCompletedAt: string
  status: RefundStatus
  /** 소비자 환불 사유 */
  reason: string
  /** 요청 시각 (ISO) — 자동 승인 기한 계산 */
  requestedAt: string
  /** 사장 거부 사유 (REJECTED 시, 소비자 노출) */
  rejectReason?: string
  /** 승인/거부 처리 시각 (ISO) */
  resolvedAt?: string
}

/** 환불 목록 세그먼트(탭) — 대기중 / 처리완료 */
export const REFUND_SEGMENTS = ['pending', 'resolved'] as const
export type RefundSegment = (typeof REFUND_SEGMENTS)[number]
