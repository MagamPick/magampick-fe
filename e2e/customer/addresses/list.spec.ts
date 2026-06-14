import { test, expect } from '../../fixtures/test'
import { spaGoto } from '../../fixtures/navigation'

/**
 * 케이스 1: 주소 목록 표시
 *
 * 가입 시 동반된 기본 주소 1개(서경로 2, 별칭 '집')가 목록에 올바르게 표시되는지 확인.
 */
test.describe('주소 설정 — 목록 표시', () => {
  test('가입 기본 주소 1개가 목록에 표시된다', async ({ customerPage }) => {
    await spaGoto(customerPage, '/addresses')

    // 화면 제목
    await expect(customerPage.getByRole('heading', { name: '주소 설정' })).toBeVisible()

    // 기본 주소 배지
    await expect(customerPage.getByText('기본 주소')).toBeVisible()

    // 가입 시 등록한 별칭 '집'
    await expect(customerPage.getByText('집')).toBeVisible()

    // 도로명 주소 (서경로 2 부분 포함)
    await expect(customerPage.getByText('서경로 2', { exact: false })).toBeVisible()

    // 주소가 1개이므로 수정 버튼도 1개 (각 카드에 '${label} 주소 수정' aria-label)
    await expect(customerPage.getByRole('button', { name: /주소 수정$/ })).toHaveCount(1)
  })
})
