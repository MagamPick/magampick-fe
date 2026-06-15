import { test, expect } from '../../fixtures/test'
import { spaGotoFresh } from '../../fixtures/navigation'
import { seedCodeAddresses, SEOKYUNG_4 } from '../../fixtures/seed'

/**
 * 케이스 3: 기본 주소 전환.
 *
 * 2번째 주소는 코드경로로 API 시드(BUG-A 회피 — UI GPS 추가는 BUG-A 로 막힘). 그 뒤 비기본 카드 본문을
 * 탭하면 기본 주소가 그 주소로 옮겨가는지 확인.
 *
 * AddressCard: [📍 | 본문 button(onSelect, disabled=isDefault) | check | 수정 button].
 */
test.describe('주소 설정 — 기본 주소 전환', () => {
  test('비기본 주소 카드 탭 → 기본 주소가 그 주소로 이동한다', async ({ customer, customerPage }) => {
    await seedCodeAddresses(customer, [SEOKYUNG_4]) // 집(기본·서경로2) + 회사(서경로4)
    await spaGotoFresh(customerPage, '/addresses')
    await expect(customerPage.getByRole('button', { name: /주소 수정$/ })).toHaveCount(2)

    const company = customerPage.getByRole('button', { name: /서경로 4/ }) // 비기본 카드 본문
    const home = customerPage.getByRole('button', { name: /서경로 2/ }) // 기본 카드 본문
    await expect(company).toBeEnabled() // 비기본 → 탭으로 전환 가능
    await expect(home).toBeDisabled() // 기본 → 비활성

    await company.click() // 기본 주소 전환

    await expect(company).toBeDisabled() // 이제 회사가 기본
    await expect(home).toBeEnabled() // 집은 더 이상 기본 아님
    await expect(customerPage.getByText('기본 주소')).toHaveCount(1) // 배지는 항상 1개
  })
})
