import type { StoreAddress } from '../types'

/**
 * 다음 우편번호 위젯으로 매장 도로명 주소 + 지오코딩 키(sigunguCode·roadnameCode)를 받는다.
 * 위젯 스크립트는 index.html 에서 로드. 위경도는 BE 가 이 키로 지오코딩한다.
 */
export function searchStoreAddress(): Promise<StoreAddress> {
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
          roadAddress: data.roadAddress,
          jibunAddress: data.jibunAddress || undefined,
          zonecode: data.zonecode,
          sigunguCode: data.sigunguCode,
          roadnameCode: data.roadnameCode,
        })
      },
    }).open()
  })
}
