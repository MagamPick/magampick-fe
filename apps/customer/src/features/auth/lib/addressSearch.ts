import type { SignupAddress } from '../types'

const DEFAULT_SIGNUP_ADDRESS_LABEL = '집'

export function searchRoadAddress(): Promise<SignupAddress> {
  return new Promise((resolve, reject) => {
    const Postcode = window.daum?.Postcode
    if (!Postcode) {
      reject(new Error('주소 검색 위젯을 불러오지 못했어요'))
      return
    }

    new Postcode({
      oncomplete: (data) => {
        if (!data.roadAddress || !data.sigunguCode || !data.roadnameCode) {
          reject(new Error('도로명 주소를 선택해주세요'))
          return
        }

        resolve({
          label: DEFAULT_SIGNUP_ADDRESS_LABEL,
          roadAddress: data.roadAddress,
          jibunAddress: data.jibunAddress || undefined,
          zonecode: data.zonecode || undefined,
          sigunguCode: data.sigunguCode,
          roadnameCode: data.roadnameCode,
        })
      },
    }).open()
  })
}
