import { z } from 'zod'

/**
 * 주문 상태 — 노션 「주문 상태 변경」 상태 머신 기준 (anchor 문서, 7종).
 * 전이 정의는 lib/orderStatus 의 canTransition, 전이 실행은 api/orderApi.
 */
export const ORDER_STATUSES = [
  'PENDING', // 주문접수 / 신규 (사장 수락 대기)
  'PREPARING', // 준비중 (수락됨)
  'READY', // 준비완료 (픽업 코드 안내됨)
  'COMPLETED', // 수령완료 / 픽업 완료 (터미널)
  'REJECTED', // 매장 거절 → 자동환불 (터미널)
  'CANCELLED', // 고객 취소 (소비자 기능 소관 — 목록엔 종료 상태로 표시만, 터미널)
  'NO_SHOW', // 미수령 (준비완료에서 사장 수동 처리, 터미널)
] as const
export type OrderStatus = (typeof ORDER_STATUSES)[number]

/** 사장 주문 목록 세그먼트(탭) — 노션 「매장 주문 목록 조회」 5세그먼트 */
export const ORDER_SEGMENTS = ['new', 'prep', 'ready', 'done', 'cancel'] as const
export type OrderSegment = (typeof ORDER_SEGMENTS)[number]

/** 주문 항목 — `price` = 단가(KRW). 합계는 Order.total */
export interface OrderItem {
  name: string
  quantity: number
  price: number
}

/** 픽업 시간 — 'ASAP'(가능한 빨리) 또는 'HH:mm' 슬롯 (노션 주문 생성: ASAP / 15분 단위) */
export type PickupTime = 'ASAP' | string

/**
 * 주문 도메인 모델 — `orders` 테이블 row.
 * mock 단계: `placedAt` ISO 문자열, `paymentMethod` 토스페이 단일(노션 주문 결제).
 * 실연동 시 apiClient + Zod 응답 검증으로 교체(api-client-convention).
 */
export interface Order {
  id: string
  storeId: string
  /** 주문번호 (표시용, 예: "1024") */
  orderNo: string
  /** 고객 닉네임 */
  customerName: string
  /** 고객 전화 — 사장에게 실제 번호 노출(픽업 연락용, 노션 주문 상세) */
  customerPhone: string
  /** 주문 시각 (ISO) */
  placedAt: string
  /** 픽업 시간 — 'ASAP' | 'HH:mm' */
  pickupTime: PickupTime
  /** 픽업 인증 코드 4자리 (주문 단위 1개, 노션 주문 생성) */
  pickupCode: string
  status: OrderStatus
  /** 픽업 요청 메모(사장 전달용, ≤80자, 선택) */
  memo?: string
  items: OrderItem[]
  /** 결제 금액 합계 (KRW) — 떨이=할인가, 일반=정상가 */
  total: number
  /** 결제수단 — MVP 토스페이 단일 (취소·환불 카드 표시용) */
  paymentMethod: string
}

/** 주문 상세 라우트 파라미터 검증 (routing-convention — Zod params) */
export const orderParamsSchema = z.object({ id: z.string().min(1) })
