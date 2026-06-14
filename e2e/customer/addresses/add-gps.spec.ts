import { test, expect } from '../../fixtures/test'
import { spaGoto } from '../../fixtures/navigation'

/**
 * 케이스 2: GPS 경로로 주소 추가 (X3 / findings A3-1·2·3 — 좌표 직접 전송).
 *
 * 자동화 가능한 추가 경로는 GPS("현재 위치로 찾기")뿐 — 검색바/주소추가는 다음(Daum) 우편번호 위젯
 * 외부 팝업이라 자동 불가. geolocation 은 config 기본(SEED_GPS=강남 테헤란로 105) 주입.
 */
test.describe('주소 추가 — GPS 경로', () => {
  test('현재 위치로 찾기 → 폼에 역지오코딩 도로명이 채워지고 추가 버튼이 활성화된다', async ({
    customerPage,
  }) => {
    await spaGoto(customerPage, '/addresses')
    await customerPage.getByRole('button', { name: '현재 위치로 찾기' }).click()

    // GPS + BE 역지오코딩 비동기 → 폼 로드
    await expect(customerPage.getByRole('heading', { name: '주소 추가' })).toBeVisible()
    // config 기본 GPS(테헤란로 105) 역지오코딩 결과가 폼에 prefilled
    await expect(customerPage.getByText('테헤란로 105', { exact: false })).toBeVisible()

    // 별칭 선택 → 제출 버튼 활성화 (여기까지가 실제로 동작하는 구간)
    await customerPage.getByRole('button', { name: /우리집/ }).click()
    await expect(customerPage.getByRole('button', { name: '추가하기' })).toBeEnabled()
  })

  /**
   * GPS 주소 추가가 끝까지(create→목록 복귀→표시) 동작한다.
   * (과거 BUG-A: GPS 주소 zonecode:null 을 FE 스키마가 거부해 저장 실패·목록 깨짐 → PR#143 .nullish() sweep 으로 해소.)
   */
  test('GPS 주소 추가 후 목록에 나타난다', async ({ customerPage }) => {
    await spaGoto(customerPage, '/addresses')
    await customerPage.getByRole('button', { name: '현재 위치로 찾기' }).click()
    await expect(customerPage.getByRole('heading', { name: '주소 추가' })).toBeVisible()
    await customerPage.getByRole('button', { name: /우리집/ }).click()
    await customerPage.getByRole('button', { name: '추가하기' }).click()

    // 목록 복귀 + 새 주소(테헤란로 105) 표시
    await expect(customerPage.getByRole('heading', { name: '주소 설정' })).toBeVisible()
    await expect(customerPage.getByText('테헤란로 105', { exact: false })).toBeVisible()
  })
})
