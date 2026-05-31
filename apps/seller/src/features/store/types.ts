import { z } from 'zod'

/** 매장 영업 상태 — `stores.operation_status` (노션: 매장 영업 상태 관리) */
export const OPERATION_STATUSES = ['OPEN', 'BREAK', 'CLOSED_TODAY'] as const
export const operationStatusSchema = z.enum(OPERATION_STATUSES)
export type OperationStatus = z.infer<typeof operationStatusSchema>

/** 요일 코드 (영업 요일 판정용) — `new Date().getDay()` 순서 */
export const WEEKDAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const
export type Weekday = (typeof WEEKDAYS)[number]

/** 보유 매장 요약 — 헤더 매장 선택기용 */
export interface StoreSummary {
  id: string
  name: string
}

/** 매장 영업 상태 — 카드/시트 렌더 소스 */
export interface StoreStatus {
  storeId: string
  operationStatus: OperationStatus
  /** 오늘 요일이 영업 요일인가 — OPEN 전환 가능 조건 (영업 요일 0개면 false) */
  canOpenToday: boolean
  /** OPEN 라벨용 오늘 마감 시각 (HH:MM). 없으면 라벨에 미표시 */
  todayCloseTime?: string
}

/** 영업 상태 관리 시트의 전환 액션 (현재 상태에서 노출되는 선택지) */
export interface StatusAction {
  /** 전환 목표 상태 (= 시트 액션 식별자) */
  to: OperationStatus
  label: string
  description: string
  icon: string
  enabled: boolean
  /** 비활성 사유 — enabled=false 일 때만 */
  disabledReason?: string
}
