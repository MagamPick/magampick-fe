import type { InquiryListParams } from '../types'

/** 문의 도메인 queryKey 헬퍼 (state-convention §3) */
export const inquiryKeys = {
  all: ['inquiries'] as const,
  lists: () => [...inquiryKeys.all, 'list'] as const,
  /** 필터·페이지 파라미터별 목록 캐시 */
  list: (params: InquiryListParams) => [...inquiryKeys.lists(), params] as const,
}
