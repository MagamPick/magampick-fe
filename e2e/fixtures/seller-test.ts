import { test as base, expect, type Page, type Browser } from '@playwright/test'
import { TARGETS } from './env'
import { createSeller, type SeededSeller } from './seller'

/**
 * 사장 앱 E2E 공용 fixtures (seller 프로젝트, baseURL=owner.dev.magampick.com).
 *
 * - `seller`     : **워커당 1회** createSeller (=국세청 1회/워커) — 읽기·경량 사장 테스트가 공유해
 *                  국세청 호출을 절감. (createSeller만 국세청을 타고, seedProduct/clearance/영업상태/시간
 *                  같은 사장 API 는 국세청 무관.)
 * - `sellerPage` : 그 사장으로 **UI 로그인**된 사장 앱 Page.
 *
 * ★ 인증은 **UI 로그인**으로 한다. BUG-C(#145)로 사장 앱에도 AuthBootstrap 이 생겨 쿠키 주입 인증이
 * 원론적으론 가능하나, 주문 목록(/orders)의 현재매장(useCurrentStoreStore) 해석이 로그인 플로우에
 * 의존해 쿠키 주입만으론 주문 목록이 비지 않는다(빈 상태 미렌더). 그래서 UI 로그인을 유지한다.
 * (하드 리로드 시 로그아웃되므로 시드 후 갱신은 `spaGoto`만 — `spaGotoFresh` 금지.)
 */
async function loginSellerViaUI(
  page: Page,
  account: { email: string; password: string },
): Promise<void> {
  await page.goto(TARGETS.seller + '/') // ProtectedRoute → /login 폼으로 클라 리다이렉트
  await page.getByRole('textbox', { name: '이메일' }).fill(account.email)
  await page.getByRole('textbox', { name: '비밀번호' }).fill(account.password)
  await page.getByRole('button', { name: '로그인' }).click()
  // 로그인 성공 → 홈으로 네비. 폼이 사라지고 URL 이 /login 을 벗어날 때까지 대기(이후 spaGoto 레이스 방지).
  await expect(page.getByRole('button', { name: '로그인' })).toBeHidden({ timeout: 15_000 })
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15_000 })
}

export const test = base.extend<{ sellerPage: Page }, { seller: SeededSeller }>({
  seller: [
    async ({}, use) => {
      const s = await createSeller()
      await use(s)
    },
    { scope: 'worker' },
  ],

  sellerPage: async ({ context, seller }, use) => {
    const page = await context.newPage()
    await loginSellerViaUI(page, seller.account)
    await use(page)
  },
})

export { expect } from '@playwright/test'

/**
 * 테스트별 격리 사장 + 인증 페이지 (영업상태 전이·빈상태 단언 등 stateful 케이스). ⚠️ createSeller=국세청
 * 호출이라 꼭 필요한 격리 케이스에만. 사용 후 반환된 close() 를 호출해 컨텍스트 정리.
 */
export async function openFreshSellerPage(
  browser: Browser,
): Promise<{ seller: SeededSeller; page: Page; close: () => Promise<void> }> {
  const seller = await createSeller()
  const context = await browser.newContext({
    baseURL: TARGETS.seller,
    locale: 'ko-KR',
    timezoneId: 'Asia/Seoul',
    viewport: { width: 393, height: 852 },
  })
  const page = await context.newPage()
  await loginSellerViaUI(page, seller.account)
  return { seller, page, close: () => context.close() }
}
