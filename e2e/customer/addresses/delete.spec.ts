import { test, expect } from '../../fixtures/test'
import { spaGoto, spaGotoFresh } from '../../fixtures/navigation'
import { seedCodeAddresses, SEOKYUNG_4 } from '../../fixtures/seed'

/**
 * 케이스 5: 삭제 성공 (비기본 주소) / 케이스 6: 삭제 가드 (마지막·기본).
 *
 * 삭제 확인창: window.confirm('이 주소를 삭제할까요?') → page.once('dialog', accept).
 * 삭제 에러는 수정 화면에 role="alert" 로 표면화. (2번째 주소는 코드경로 API 시드 — BUG-A 회피.)
 *
 * 관찰된 BE 차단 (실측):
 *   - 마지막 주소: LAST_ADDRESS_DELETE_BLOCKED "마지막 주소지는 삭제할 수 없습니다"
 *   - 기본 주소(마지막 아님): DEFAULT_ADDRESS_DELETE_BLOCKED "기본 주소지는 삭제할 수 없습니다"
 *   - BE 검증 순서: 1개면 LAST 먼저, 2개 이상 기본주소면 DEFAULT.
 */
test.describe('주소 삭제 — 성공', () => {
  test('비기본 주소 삭제 → 목록에서 사라진다', async ({ customer, customerPage }) => {
    await seedCodeAddresses(customer, [SEOKYUNG_4]) // 집(기본) + 회사(비기본)
    await spaGotoFresh(customerPage, '/addresses')
    await expect(customerPage.getByRole('button', { name: /주소 수정$/ })).toHaveCount(2)

    await customerPage.getByRole('button', { name: '회사 주소 수정' }).click()
    await expect(customerPage.getByRole('heading', { name: '주소 수정' })).toBeVisible()

    customerPage.once('dialog', (dialog) => dialog.accept())
    await customerPage.getByRole('button', { name: '주소 삭제' }).click()

    // 목록 복귀 + '회사' 사라짐 + 1개만 남음
    await expect(customerPage.getByRole('heading', { name: '주소 설정' })).toBeVisible()
    await expect(customerPage.getByText('회사')).toHaveCount(0)
    await expect(customerPage.getByRole('button', { name: /주소 수정$/ })).toHaveCount(1)
  })
})

test.describe('주소 삭제 — 가드 (BE 차단)', () => {
  test('마지막 주소 삭제 시도 → "마지막 주소지는 삭제할 수 없습니다"', async ({ customerPage }) => {
    // 가입 직후 유일한 기본 주소 '집' (코드경로 — 목록 정상) → LAST 차단
    await spaGoto(customerPage, '/addresses')
    await customerPage.getByRole('button', { name: '집 주소 수정' }).click()
    await expect(customerPage.getByRole('heading', { name: '주소 수정' })).toBeVisible()

    customerPage.once('dialog', (dialog) => dialog.accept())
    await customerPage.getByRole('button', { name: '주소 삭제' }).click()

    await expect(customerPage.getByRole('alert')).toHaveText('마지막 주소지는 삭제할 수 없습니다')
    await expect(customerPage.getByRole('heading', { name: '주소 수정' })).toBeVisible() // 머묾
  })

  test('기본 주소(마지막 아님) 삭제 시도 → "기본 주소지는 삭제할 수 없습니다"', async ({
    customer,
    customerPage,
  }) => {
    await seedCodeAddresses(customer, [SEOKYUNG_4]) // 집(기본) + 회사 → 집은 더 이상 '마지막' 아님
    await spaGotoFresh(customerPage, '/addresses')
    await customerPage.getByRole('button', { name: '집 주소 수정' }).click()
    await expect(customerPage.getByRole('heading', { name: '주소 수정' })).toBeVisible()

    customerPage.once('dialog', (dialog) => dialog.accept())
    await customerPage.getByRole('button', { name: '주소 삭제' }).click()

    await expect(customerPage.getByRole('alert')).toHaveText('기본 주소지는 삭제할 수 없습니다')
    await expect(customerPage.getByRole('heading', { name: '주소 수정' })).toBeVisible()
  })
})
