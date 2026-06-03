import { useQuery } from '@tanstack/react-query'
import { supportApi } from '../api/supportApi'
import { supportKeys } from './supportKeys'

/** 내 문의 내역 (최신순) */
export function useInquiries() {
  return useQuery({
    queryKey: supportKeys.inquiries(),
    queryFn: () => supportApi.listInquiries(),
  })
}
