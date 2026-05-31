import { WEEKDAY_ORDER, WEEKDAY_LABEL, timeSchema } from '../types'
import type { BusinessHour, DayHoursForm, OperationStatus, Weekday } from '../types'

/** 휴무일 토글 대비 기본 영업 시각 */
const DEFAULT_OPEN = '09:00'
const DEFAULT_CLOSE = '21:00'

/** 영업일 행(영업 요일만) → 월~일 7행 폼. 휴무일은 closed=true + 기본 시각. */
export function toFormDays(hours: BusinessHour[]): DayHoursForm[] {
  return WEEKDAY_ORDER.map((day) => {
    const hour = hours.find((h) => h.day === day)
    if (hour) {
      return { day, closed: false, openTime: hour.openTime, closeTime: hour.closeTime }
    }
    return { day, closed: true, openTime: DEFAULT_OPEN, closeTime: DEFAULT_CLOSE }
  })
}

/** 폼 7행 → 영업일만(휴무 제외) BusinessHour[]. 저장 payload. */
export function toBusinessHours(days: DayHoursForm[]): BusinessHour[] {
  return days
    .filter((d) => !d.closed)
    .map((d) => ({ day: d.day, openTime: d.openTime, closeTime: d.closeTime }))
}

/** "09:00 – 21:00" 표기 (프로토타입 표기 일치) */
export function formatRange(openTime: string, closeTime: string): string {
  return `${openTime} – ${closeTime}`
}

/**
 * 영업중(OPEN) + 오늘 요일 + 오늘이 영업일(행 존재)이면 잠금.
 * 오늘이 휴무(행 없음)면 신규 추가는 허용 → 잠금 아님.
 */
export function isTodayLocked(
  day: Weekday,
  today: Weekday,
  operationStatus: OperationStatus,
  todayOpen: boolean,
): boolean {
  return operationStatus === 'OPEN' && day === today && todayOpen
}

/**
 * 저장 시 '오늘 행' 변경 여부 (TODAY_BUSINESS_HOURS_LOCKED 판정용).
 * - 오늘 시각 수정 / 삭제(휴무 전환) → true
 * - 오늘 신규 추가(이전 휴무) / 다른 요일만 변경 / 변화 없음 → false
 */
export function hasTodayHoursChanged(
  prev: BusinessHour[],
  next: BusinessHour[],
  today: Weekday,
): boolean {
  const before = prev.find((h) => h.day === today)
  const after = next.find((h) => h.day === today)
  if (!before) return false // 이전에 휴무 → 추가/유지 모두 허용
  if (!after) return true // 오늘 행 삭제(휴무 전환)
  return before.openTime !== after.openTime || before.closeTime !== after.closeTime
}

export interface WeekSummaryRow {
  day: Weekday
  label: string
  text: string
  closed: boolean
}

/** 읽기전용 주간 요약 (매장 관리 카드) — 월~일 7행. */
export function summarizeWeek(hours: BusinessHour[]): WeekSummaryRow[] {
  return WEEKDAY_ORDER.map((day) => {
    const hour = hours.find((h) => h.day === day)
    return {
      day,
      label: WEEKDAY_LABEL[day],
      text: hour ? formatRange(hour.openTime, hour.closeTime) : '휴무',
      closed: !hour,
    }
  })
}

/** 시(00–23) / 분(00–59) 드롭다운 옵션 */
export const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
export const MINUTE_OPTIONS = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'))

/** "HH:MM" → { hour, minute } */
export function splitTime(hhmm: string): { hour: string; minute: string } {
  const [hour = '00', minute = '00'] = hhmm.split(':')
  return { hour, minute }
}

/** { hour, minute } → "HH:MM" */
export function joinTime(hour: string, minute: string): string {
  return `${hour}:${minute}`
}

/** 폼 1행 검증 메시지 (편집 시트 인라인용). null = 유효. */
export function dayHoursError(
  day: Pick<DayHoursForm, 'closed' | 'openTime' | 'closeTime'>,
): string | null {
  if (day.closed) return null
  if (!timeSchema.safeParse(day.openTime).success || !timeSchema.safeParse(day.closeTime).success) {
    return '오픈·마감 시간을 모두 입력해 주세요.'
  }
  if (day.openTime >= day.closeTime) return '마감 시간은 오픈 시간 이후여야 해요.'
  return null
}
