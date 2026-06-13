import { useMutation } from '@tanstack/react-query'
import { addressesApi } from '../api/addressesApi'
import type { AddressSearchResult } from '../types'

/**
 * 현재 위치(GPS) → 역지오코딩 → AddressSearchResult({ roadAddress, latitude, longitude }).
 * - 권한 거부(code 1) / 위치 불가(code 2) / 기타 에러 시 에러 메시지로 reject
 * - 성공 시 roadAddress + 입력 GPS 좌표(lat/lng)를 보존해 하류(폼)로 전달.
 *   코드류(sigunguCode 등)는 undefined — 폼이 좌표 보유를 보고 raw 좌표를 BE 에 직접 전송 (X3)
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
              const { latitude, longitude } = position.coords
              const result = await addressesApi.reverseGeocode({ latitude, longitude })
              resolve({ roadAddress: result.roadAddress, latitude, longitude })
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
