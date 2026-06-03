import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { searchApi } from '../api/searchApi'
import { searchKeys } from './searchKeys'

/**
 * 자동완성 제안 — 입력어(보통 디바운스된 값 전달)가 1글자 이상일 때만 조회.
 * 이전 결과를 유지(keepPreviousData)해 타이핑 중 드롭다운 깜빡임 방지.
 */
export function useAutocomplete(q: string) {
  return useQuery({
    queryKey: searchKeys.suggestions(q),
    queryFn: () => searchApi.autocomplete({ q }),
    enabled: q.trim().length >= 1,
    placeholderData: keepPreviousData,
  })
}
