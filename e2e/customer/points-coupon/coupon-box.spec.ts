import { test, expect } from '../../fixtures/test'
import { spaGoto } from '../../fixtures/navigation'

/**
 * P8-05 보조 — 쿠폰함 렌더 확인
 *
 * 신규 소비자 기준 dev 실측:
 *   - 가입 직후 "신규 가입 축하 쿠폰" 1장 자동 지급 (USABLE)
 *   - 쿠폰함(/mypage/coupons) 기본 탭 = 사용 가능, 가입 축하 쿠폰 바로 표시
 *
 * deep-link 404 제약: spaGoto 로만 이동. spaGotoFresh 불필요 (API 시드 없이 가입 직후 상태 그대로).
 */
test.describe('쿠폰함 — 렌더 검증 (신규 계정)', () => {
  test('쿠폰함이 렌더되고 가입 축하 쿠폰이 사용 가능 탭에 표시된다', async ({ customerPage }) => {
    await spaGoto(customerPage, '/mypage/coupons')

    // 화면 제목
    await expect(customerPage.getByRole('heading', { name: '쿠폰함' })).toBeVisible()

    // 탭 3개 존재
    await expect(customerPage.getByRole('tab', { name: /사용 가능/ })).toBeVisible()
    await expect(customerPage.getByRole('tab', { name: /사용 완료/ })).toBeVisible()
    await expect(customerPage.getByRole('tab', { name: /만료/ })).toBeVisible()

    // "사용 가능" 탭이 기본 선택됨 (aria-selected)
    await expect(customerPage.getByRole('tab', { name: /사용 가능/ })).toHaveAttribute(
      'aria-selected',
      'true',
    )

    // 가입 축하 쿠폰 라벨 표시 — USABLE 탭에서 CouponCard 렌더됨
    await expect(customerPage.getByText('신규 가입 축하 쿠폰')).toBeVisible()
  })

  test('이벤트 → 버튼 클릭 시 이벤트 화면으로 이동한다', async ({ customerPage }) => {
    await spaGoto(customerPage, '/mypage/coupons')
    await expect(customerPage.getByRole('heading', { name: '쿠폰함' })).toBeVisible()

    await customerPage.getByRole('button', { name: '이벤트 →' }).click()

    // 이벤트 화면 진입 확인
    await expect(customerPage.getByRole('heading', { name: '이벤트' })).toBeVisible()
    // 이벤트 화면 배너 문구
    await expect(customerPage.getByText('진행 중인 쿠폰 이벤트')).toBeVisible()
  })
})
