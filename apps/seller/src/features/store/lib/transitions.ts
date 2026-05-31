import type { OperationStatus, StatusAction } from '../types'

/** 헤더 카드 상태 라벨. OPEN 은 오늘 마감 시각을 덧붙인다. */
export function getStatusLabel(status: OperationStatus, todayCloseTime?: string): string {
  if (status === 'OPEN') return todayCloseTime ? `영업중 · ${todayCloseTime} 마감` : '영업중'
  if (status === 'BREAK') return '잠시 휴식중'
  return '오늘 영업 종료' // CLOSED_TODAY
}

/** 인디케이터 dot 색 — globals.css 토큰 클래스 */
export function getStatusDotClass(status: OperationStatus): string {
  if (status === 'OPEN') return 'bg-success'
  if (status === 'BREAK') return 'bg-warning'
  return 'bg-muted-foreground' // CLOSED_TODAY
}

const OPEN_DISABLED_REASON = '오늘은 영업 요일이 아니에요'

/** OPEN 진입 액션 (영업 시작 / 영업 재개) — canOpenToday 일 때만 활성 */
function openAction(label: string, canOpenToday: boolean): StatusAction {
  return {
    to: 'OPEN',
    label,
    description: '소비자에게 다시 노출되고 주문을 받아요.',
    icon: '🟢',
    enabled: canOpenToday,
    disabledReason: canOpenToday ? undefined : OPEN_DISABLED_REASON,
  }
}

const BREAK_ACTION: StatusAction = {
  to: 'BREAK',
  label: '잠시 휴식',
  description: '곧 돌아올게요. 소비자 노출이 잠시 멈춰요.',
  icon: '⏸️',
  enabled: true,
}

const CLOSE_ACTION: StatusAction = {
  to: 'CLOSED_TODAY',
  label: '오늘 영업 종료',
  description: '오늘 영업을 마쳐요. 다시 열려면 [영업 시작].',
  icon: '🔚',
  enabled: true,
}

/**
 * 현재 상태에서 노출할 전환 액션 (노션 상태 전이 스펙).
 * - CLOSED_TODAY → [영업 시작]
 * - OPEN         → [잠시 휴식, 오늘 영업 종료]
 * - BREAK        → [영업 재개, 오늘 영업 종료]
 * 자기 전이·금지 전이(CLOSED_TODAY→BREAK)는 노출 X. OPEN 진입은 canOpenToday 필요.
 */
export function getAvailableActions(
  status: OperationStatus,
  canOpenToday: boolean,
): StatusAction[] {
  if (status === 'OPEN') return [BREAK_ACTION, CLOSE_ACTION]
  if (status === 'BREAK') return [openAction('영업 재개', canOpenToday), CLOSE_ACTION]
  return [openAction('영업 시작', canOpenToday)] // CLOSED_TODAY
}

/**
 * 전환 가능 여부 (mock API 검증 + UI 방어).
 * OPEN 진입은 오늘이 영업 요일일 때만. 자기 전이·CLOSED_TODAY→BREAK 등은 거부.
 */
export function canTransition(
  from: OperationStatus,
  to: OperationStatus,
  canOpenToday: boolean,
): boolean {
  if (from === to) return false
  if (to === 'OPEN') return (from === 'CLOSED_TODAY' || from === 'BREAK') && canOpenToday
  if (to === 'BREAK') return from === 'OPEN'
  if (to === 'CLOSED_TODAY') return from === 'OPEN' || from === 'BREAK'
  return false
}
