import type { InquiryCategory, InquiryListParams, InquiryStatus } from '../types'

/**
 * "전체" 센티넬 — radix Select 는 빈 문자열 value 를 허용하지 않으므로 'all' 로 표현.
 * API 호출 시 undefined(전체)로 매핑한다.
 */
export const ALL_FILTER = 'all'

export type StatusFilter = InquiryStatus | typeof ALL_FILTER
export type CategoryFilter = InquiryCategory | typeof ALL_FILTER

/** 필터 상태 + 페이지 → 목록 API 파라미터. 'all' 은 undefined(전체)로 변환. */
export function toListParams(
  status: StatusFilter,
  category: CategoryFilter,
  page: number,
): InquiryListParams {
  return {
    status: status === ALL_FILTER ? undefined : status,
    category: category === ALL_FILTER ? undefined : category,
    page,
  }
}
