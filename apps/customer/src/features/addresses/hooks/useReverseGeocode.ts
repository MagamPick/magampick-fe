import { useMutation } from '@tanstack/react-query'
import { addressesApi } from '../api/addressesApi'

/** 현재 위치(GPS) → 도로명 주소 역지오코딩 (mock — ADR-002). "현재 위치로 추가" 클릭 시 실행. */
export function useReverseGeocode() {
  return useMutation({
    mutationFn: () => addressesApi.reverseGeocodeCurrentPosition(),
  })
}
