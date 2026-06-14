import { test, expect } from '../../fixtures/test'
import { spaGotoFresh } from '../../fixtures/navigation'
import { seedCodeAddresses, SEOKYUNG_4, SEOKYUNG_6 } from '../../fixtures/seed'

/**
 * 케이스 7: 주소 개수 한도 (MAX_ADDRESSES = 3).
 *
 * 가입 기본 1개 + 코드경로 2개(API 시드) = 3개 채운 뒤, 4번째를 GPS 폼으로 추가 시도 →
 * BE 가 ADDRESS_LIMIT_EXCEEDED(409)로 거부 → 폼에 "주소지는 최대 3개까지 등록 가능합니다".
 * (한도 거부는 create 응답 자체가 에러라 BUG-A zonecode-parse 와 무관 → 정상 검증 가능.)
 */
test.describe('주소 개수 한도', () => {
  test('3개 채운 뒤 4번째 추가 시도 → ADDRESS_LIMIT_EXCEEDED, 목록 3개 유지', async ({
    customer,
    customerPage,
  }) => {
    await seedCodeAddresses(customer, [SEOKYUNG_4, SEOKYUNG_6]) // 집 + 회사 + 학교 = 3
    await spaGotoFresh(customerPage, '/addresses')
    await expect(customerPage.getByRole('button', { name: /주소 수정$/ })).toHaveCount(3)

    // 4번째 추가 시도 (GPS 폼)
    await customerPage.getByRole('button', { name: '현재 위치로 찾기' }).click()
    await expect(customerPage.getByRole('heading', { name: '주소 추가' })).toBeVisible()
    await customerPage.getByRole('button', { name: /기타/ }).click()
    await expect(customerPage.getByRole('button', { name: '추가하기' })).toBeEnabled()
    await customerPage.getByRole('button', { name: '추가하기' }).click()

    // BE 한도 거부 메시지 표면화
    await expect(customerPage.getByRole('alert')).toHaveText('주소지는 최대 3개까지 등록 가능합니다')
    await expect(customerPage.getByRole('heading', { name: '주소 추가' })).toBeVisible() // 폼 유지

    // 뒤로 → 목록 여전히 3개
    await customerPage.getByRole('button', { name: '뒤로 가기' }).click()
    await expect(customerPage.getByRole('heading', { name: '주소 설정' })).toBeVisible()
    await expect(customerPage.getByRole('button', { name: /주소 수정$/ })).toHaveCount(3)
  })
})
