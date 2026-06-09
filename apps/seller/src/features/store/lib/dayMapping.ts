import type { Weekday } from '../types'

/** BE 요일 enum (openapi-typescript 생성값) */
export type BeWeekday =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY'

/** FE 소문자 3글자 요일 → BE 대문자 영문 요일 */
export const WEEKDAY_TO_BE: Record<Weekday, BeWeekday> = {
  mon: 'MONDAY',
  tue: 'TUESDAY',
  wed: 'WEDNESDAY',
  thu: 'THURSDAY',
  fri: 'FRIDAY',
  sat: 'SATURDAY',
  sun: 'SUNDAY',
}

/** BE 대문자 영문 요일 → FE 소문자 3글자 요일 */
export const BE_TO_WEEKDAY: Record<BeWeekday, Weekday> = {
  MONDAY: 'mon',
  TUESDAY: 'tue',
  WEDNESDAY: 'wed',
  THURSDAY: 'thu',
  FRIDAY: 'fri',
  SATURDAY: 'sat',
  SUNDAY: 'sun',
}
