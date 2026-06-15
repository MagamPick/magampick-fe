import { test, expect } from '../../fixtures/test'
import { spaGoto } from '../../fixtures/navigation'

/**
 * 케이스 4: 주소 수정 (별칭 / 상세 주소).
 *
 * ★ BUG-B (PR#144 머지됐으나 **라이브 dev 미반영** — 2026-06-15 실측 시 수정 저장이 여전히 400
 *   "잘못된 입력입니다"): 수정 폼이 PATCH 에 roadAddress 만 보내고 좌표/코드 누락 → BE geocodeKeyValid
 *   400. 수정=effectiveRoad 에 기존 lat/lng 포함(#144). **커스터머 앱 재배포가 #144 를 실제로 포함하면
 *   이 두 test.fail 이 통과로 뒤집힘** → 그때 마커 제거. (add-gps BUG-A=#143 는 이미 라이브 반영 확인.)
 */
test.describe('주소 설정 — 수정 (BUG-B, 라이브 미반영)', () => {
  test('별칭 변경 → 저장 → 목록에 반영된다', async ({ customerPage }) => {
    test.fail(true, 'BUG-B: 수정 PATCH geocodeKeyValid 400 (PR#144 라이브 미반영)')
    await spaGoto(customerPage, '/addresses')
    await customerPage.getByRole('button', { name: '집 주소 수정' }).click()
    await expect(customerPage.getByRole('heading', { name: '주소 수정' })).toBeVisible()

    await customerPage.getByRole('button', { name: /학교/ }).click() // 별칭 칩
    await customerPage.getByRole('button', { name: '저장' }).click()

    await expect(customerPage.getByRole('heading', { name: '주소 설정' })).toBeVisible({
      timeout: 5000,
    })
    await expect(customerPage.getByText('학교')).toBeVisible({ timeout: 5000 })
  })

  test('상세 주소 변경 → 저장 → 목록에 반영된다', async ({ customerPage }) => {
    test.fail(true, 'BUG-B: 수정 PATCH geocodeKeyValid 400 (PR#144 라이브 미반영)')
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
