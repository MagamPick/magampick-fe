import { test, expect } from '../../fixtures/test'
import { spaGoto } from '../../fixtures/navigation'

/**
 * 케이스 4: 주소 수정 (별칭 / 상세 주소).
 *
 * ★ BUG-B: 수정 폼 `onSubmit` 이 PATCH 페이로드에 `roadAddress` 를 항상 포함하지만 좌표·코드는
 * 누락한다 — `effectiveRoad` 가 기존 Address 에서 파생될 때 `latitude/longitude` 를 옮기지 않아
 * `hasCoords=false` → `sigunguCode/roadnameCode`(둘 다 undefined)를 보냄. BE `@AssertTrue(geocodeKeyValid)`
 * 가 "roadAddress 변경 시 코드 동반 필수"를 강제 → **400 INVALID_INPUT** ("주소 변경 시 sigunguCode 와
 * roadnameCode 는 함께 전송해야 합니다") → 모든 수정 저장이 실패한다(별칭/상세만 바꿔도).
 *   수정: AddressFormPage `effectiveRoad` 파생에 `latitude/longitude` 포함(=hasCoords true),
 *         또는 도로명 미변경 시 roadAddress/코드를 payload 에서 생략.
 *   참고: PATCH `{label}` 단독은 200 (BE 정상). FE 가 roadAddress 를 끼워 보내는 게 원인.
 * 수정되면 두 test.fail 이 통과로 뒤집혀 마커 제거를 요구한다.
 */
test.describe('주소 설정 — 수정 (BUG-B)', () => {
  test('별칭 변경 → 저장 → 목록에 반영된다', async ({ customerPage }) => {
    test.fail(true, 'BUG-B: 수정 PATCH geocodeKeyValid 400 → 저장 실패')
    await spaGoto(customerPage, '/addresses')
    await customerPage.getByRole('button', { name: '집 주소 수정' }).click()
    await expect(customerPage.getByRole('heading', { name: '주소 수정' })).toBeVisible()

    await customerPage.getByRole('button', { name: /학교/ }).click() // 별칭 칩
    await customerPage.getByRole('button', { name: '저장' }).click()

    // 기대: 목록 복귀 + '학교' 반영. 현재: 400 으로 폼에 머물며 에러 → 실패(expected).
    await expect(customerPage.getByRole('heading', { name: '주소 설정' })).toBeVisible({
      timeout: 5000,
    })
    await expect(customerPage.getByText('학교')).toBeVisible({ timeout: 5000 })
  })

  test('상세 주소 변경 → 저장 → 목록에 반영된다', async ({ customerPage }) => {
    test.fail(true, 'BUG-B: 수정 PATCH geocodeKeyValid 400 → 저장 실패')
    await spaGoto(customerPage, '/addresses')
    await customerPage.getByRole('button', { name: '집 주소 수정' }).click()
    await expect(customerPage.getByRole('heading', { name: '주소 수정' })).toBeVisible()

    await customerPage.getByPlaceholder('동·호수, 건물명 등').fill('202호')
    await customerPage.getByRole('button', { name: '저장' }).click()

    await expect(customerPage.getByRole('heading', { name: '주소 설정' })).toBeVisible({
      timeout: 5000,
    })
    await expect(customerPage.getByText('202호', { exact: false })).toBeVisible({ timeout: 5000 })
  })
})
