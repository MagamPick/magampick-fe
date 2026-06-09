import { useMutation } from '@tanstack/react-query'
import { addressesApi } from '../api/addressesApi'
import type { AddressSearchResult } from '../types'

/**
 * 현재 위치(GPS) → 역지오코딩 → AddressSearchResult({ roadAddress }).
 * - 권한 거부(code 1) / 위치 불가(code 2) / 기타 에러 시 에러 메시지로 reject
 * - 성공 시 roadAddress 만 포함 (sigunguCode 등 코드류는 undefined — BE 가 roadAddress 로 지오코딩)
 */
export function useReverseGeocode() {
  return useMutation({
    mutationFn: (): Promise<AddressSearchResult> =>
      new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('이 기기에서 위치 서비스를 지원하지 않아요'))
          return
        }
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const result = await addressesApi.reverseGeocode({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              })
              resolve({ roadAddress: result.roadAddress })
            } catch (error) {
              reject(error)
            }
          },
          (err) => {
            const message =
              err.code === 1
                ? '위치 접근이 거부되었어요. 설정에서 위치 권한을 허용해주세요.'
                : err.code === 2
                  ? '현재 위치를 찾을 수 없어요. 잠시 후 다시 시도해주세요.'
                  : '위치를 가져오는 중 문제가 발생했어요.'
            reject(new Error(message))
          },
          { timeout: 10000 },
        )
      }),
  })
}
