import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { inquiryApi } from '../api/inquiryApi'
import { inquiryKeys } from './inquiryKeys'
import type { InquiryListParams } from '../types'

/**
 * 문의 목록 — 필터(status·category)·페이지 파라미터별 캐시.
 * 페이지/필터 전환 시 이전 데이터를 유지(keepPreviousData)해 깜빡임을 줄인다.
 */
export function useInquiries(params: InquiryListParams) {
  return useQuery({
    queryKey: inquiryKeys.list(params),
    queryFn: () => inquiryApi.listInquiries(params),
    placeholderData: keepPreviousData,
  })
}
