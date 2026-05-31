import { useQuery } from '@tanstack/react-query'
import { addressesApi } from '../api/addressesApi'
import { addressKeys } from './addressQueryKeys'

/** 저장된 주소 목록 (서버 상태). 기본 주소 정확히 1개 포함. */
export function useAddresses() {
  return useQuery({
    queryKey: addressKeys.list(),
    queryFn: () => addressesApi.list(),
  })
}
