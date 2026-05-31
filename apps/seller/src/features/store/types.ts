import { z } from 'zod'

/** 매장 영업 상태 — `stores.operation_status` (노션: 매장 영업 상태 관리) */
export const OPERATION_STATUSES = ['OPEN', 'BREAK', 'CLOSED_TODAY'] as const
export const operationStatusSchema = z.enum(OPERATION_STATUSES)
export type OperationStatus = z.infer<typeof operationStatusSchema>

/** 요일 코드 (영업 요일 판정용) — `new Date().getDay()` 순서 */
export const WEEKDAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const
export type Weekday = (typeof WEEKDAYS)[number]
export const weekdaySchema = z.enum(WEEKDAYS)

/** 요일 표시 순서 — 월요일 선두 (영업시간 화면 행 순서). WEEKDAYS 는 getDay() 순(일선두)이라 별도 */
export const WEEKDAY_ORDER = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const

/** 요일 한글 라벨 */
export const WEEKDAY_LABEL: Record<Weekday, string> = {
  mon: '월요일',
  tue: '화요일',
  wed: '수요일',
  thu: '목요일',
  fri: '금요일',
  sat: '토요일',
  sun: '일요일',
}

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

/** HH:MM (24시간·분 단위) */
export const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, '시:분 형식이 올바르지 않습니다')

/**
 * 영업일 1건 — `store_business_hours` row. **영업 요일만 존재** (휴무 요일은 row 없음).
 * 조회/저장 단위 (FE↔mock, 추후 BE 연동).
 */
export interface BusinessHour {
  day: Weekday
  /** HH:MM */
  openTime: string
  /** HH:MM */
  closeTime: string
}

/**
 * 영업시간 폼 1행 — 월~일 7행 고정 렌더용. `closed=true` 면 시각은 무시(휴무).
 * 저장 시 `closed=false` 행만 모아 BusinessHour[] 로 변환.
 */
const dayHoursFormSchema = z
  .object({
    day: weekdaySchema,
    closed: z.boolean(),
    openTime: z.string(),
    closeTime: z.string(),
  })
  .refine(
    (d) =>
      d.closed ||
      (timeSchema.safeParse(d.openTime).success &&
        timeSchema.safeParse(d.closeTime).success &&
        d.openTime < d.closeTime),
    { message: '마감 시간은 오픈 시간 이후여야 해요', path: ['closeTime'] },
  )

/** 영업시간 설정 폼 — 월~일 7행 */
export const businessHoursFormSchema = z.object({
  days: z.array(dayHoursFormSchema).length(7),
})
export type BusinessHoursForm = z.infer<typeof businessHoursFormSchema>
export type DayHoursForm = BusinessHoursForm['days'][number]
