import { useQuery } from '@tanstack/react-query'
import { addressesApi } from '../api/addressesApi'
import { addressKeys } from './addressQueryKeys'

/** 도로명·건물명 주소 검색 (mock 카카오 로컬 — ADR-002). 검색어가 있을 때만 실행. */
export function useAddressSearch(query: string) {
  return useQuery({
    queryKey: addressKeys.search(query),
    queryFn: () => addressesApi.searchAddress(query),
    enabled: query.trim().length > 0,
  })
}
