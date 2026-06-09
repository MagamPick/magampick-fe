import type { AddressSearchResult } from '../types'

/**
 * 다음 우편번호 위젯을 명령형으로 열어 사용자 선택 결과를 AddressSearchResult 로 반환.
 * 좌표는 포함하지 않음 — BE 가 sigunguCode+roadnameCode 또는 roadAddress 로 지오코딩.
 * (auth/lib/addressSearch.ts 의 signup 전용 버전에서 label 기본값 제거 + 주소지 관리 전용으로 분리)
 */
export function searchAddressForAddresses(): Promise<AddressSearchResult> {
  return new Promise((resolve, reject) => {
    const Postcode = window.daum?.Postcode
    if (!Postcode) {
      reject(new Error('주소 검색 위젯을 불러오지 못했어요'))
      return
    }

    new Postcode({
      oncomplete: (data) => {
        if (!data.roadAddress) {
          reject(new Error('도로명 주소를 선택해주세요'))
          return
        }
        resolve({
          roadAddress: data.roadAddress,
          jibunAddress: data.jibunAddress || undefined,
          zonecode: data.zonecode || undefined,
          sigunguCode: data.sigunguCode || undefined,
          roadnameCode: data.roadnameCode || undefined,
        })
      },
    }).open()
  })
}
