import type { OrderSegment, OrderStatus, PickupTime } from '../types'

/** 상태 → 목록 세그먼트 (거절·취소·미수령은 모두 취소·환불). */
const SEGMENT_BY_STATUS: Record<OrderStatus, OrderSegment> = {
  PENDING: 'new',
  PREPARING: 'prep',
  READY: 'ready',
  COMPLETED: 'done',
  REJECTED: 'cancel',
  CANCELLED: 'cancel',
  NO_SHOW: 'cancel',
}

export function statusToSegment(status: OrderStatus): OrderSegment {
  return SEGMENT_BY_STATUS[status]
}

/** 상태 배지 라벨 — 취소·환불 안에서 매장 거절/고객 취소/미수령을 구분 표기. */
export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: '신규 주문',
  PREPARING: '준비중',
  READY: '준비완료',
  COMPLETED: '픽업 완료',
  REJECTED: '매장 거절',
  CANCELLED: '고객 취소',
  NO_SHOW: '미수령',
}

/** 세그먼트 탭 라벨. */
export const ORDER_SEGMENT_LABEL: Record<OrderSegment, string> = {
  new: '신규',
  prep: '준비중',
  ready: '준비완료',
  done: '완료',
  cancel: '취소·환불',
}

/**
 * 사장 주도 허용 전이 (노션 「주문 상태 변경」 머신).
 * PENDING→PREPARING/REJECTED, PREPARING→READY, READY→COMPLETED/NO_SHOW. 그 외 거부.
 * (CANCELLED 은 소비자 취소 소관 — 사장 전이엔 포함하지 않음)
 */
const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['PREPARING', 'REJECTED'],
  PREPARING: ['READY'],
  READY: ['COMPLETED', 'NO_SHOW'],
  COMPLETED: [],
  REJECTED: [],
  CANCELLED: [],
  NO_SHOW: [],
}

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to)
}

export type TimelineNodeState = 'done' | 'current' | 'upcoming' | 'cancelled'
export interface TimelineNode {
  label: string
  state: TimelineNodeState
}

/** 사장 상세 타임라인 4노드 (노션 「주문 상세 조회(사장)」). */
const TIMELINE_LABELS = ['주문 접수', '주문 수락', '준비 완료', '픽업 완료'] as const
/** 진행 상태별 done 노드 개수 (PENDING 1 ~ COMPLETED 4). */
const DONE_COUNT: Partial<Record<OrderStatus, number>> = {
  PENDING: 1,
  PREPARING: 2,
  READY: 3,
  COMPLETED: 4,
}
const TERMINAL_NODE_LABEL: Partial<Record<OrderStatus, string>> = {
  REJECTED: '주문 거절',
  CANCELLED: '주문 취소',
  NO_SHOW: '미수령',
}

/**
 * 상태 → 타임라인 노드. 진행(PENDING~COMPLETED)은 4노드 done/current/upcoming,
 * 종료(거절·취소·미수령)는 [주문 접수 done → 종료 노드 cancelled] 2개.
 */
export function timelineNodes(status: OrderStatus): TimelineNode[] {
  const terminal = TERMINAL_NODE_LABEL[status]
  if (terminal) {
    return [
      { label: '주문 접수', state: 'done' },
      { label: terminal, state: 'cancelled' },
    ]
  }
  const doneCount = DONE_COUNT[status] ?? 0
  return TIMELINE_LABELS.map((label, i) => ({
    label,
    state: i < doneCount ? 'done' : i === doneCount ? 'current' : 'upcoming',
  }))
}

/** 주문 시각 표시 — 오늘이면 "오늘 HH:mm", 아니면 "M/D HH:mm". */
export function formatPlacedAt(iso: string, now: Date = new Date()): string {
  const d = new Date(iso)
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  return sameDay ? `오늘 ${hh}:${mm}` : `${d.getMonth() + 1}/${d.getDate()} ${hh}:${mm}`
}

/** 픽업 시간 표시 — ASAP 은 "가능한 빨리", 슬롯은 HH:mm 그대로. */
export function formatPickup(pickupTime: PickupTime): string {
  return pickupTime === 'ASAP' ? '가능한 빨리' : pickupTime
}
