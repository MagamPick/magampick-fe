import { test as base, type Page, type Browser } from '@playwright/test'
import { TARGETS } from './env'
import { createSeller, loginSeller, type SeededSeller } from './seller'

/**
 * 사장 앱 E2E 공용 fixtures (seller 프로젝트, baseURL=owner.dev.magampick.com).
 *
 * - `seller`     : **워커당 1회** createSeller (=국세청 1회/워커) — 읽기·경량 사장 테스트가 공유해
 *                  국세청 호출을 절감. (createSeller만 국세청을 타고, seedProduct/clearance/영업상태/시간
 *                  같은 사장 API 는 국세청 무관.)
 * - `sellerPage` : 그 사장으로 **쿠키 주입 인증 부팅**된 사장 앱 Page.
 *
 * ★ 사장 앱도 이제 customer/admin 처럼 **AuthBootstrap(부팅 silent refresh)** 가 있다(BUG-C fix PR#145)
 * → refresh 쿠키를 BrowserContext 에 심고 page.goto 하면 인증 복구된다(UI 로그인 불필요, 리로드 시
 * 세션 복원). 시드 후 화면 갱신은 `spaGoto` 면 충분하나 `spaGotoFresh`(하드 리로드)도 안전하다.
 */
export const test = base.extend<{ sellerPage: Page }, { seller: SeededSeller }>({
  seller: [
    async ({}, use) => {
      const s = await createSeller()
      await use(s)
    },
    { scope: 'worker' },
  ],

  sellerPage: async ({ context, seller }, use) => {
    await loginSeller(context.request, seller.account.email, seller.account.password) // refresh 쿠키 적재
    const page = await context.newPage()
    await page.goto(TARGETS.seller + '/') // AuthBootstrap 가 쿠키로 access 복구
    await use(page)
  },
})

export { expect } from '@playwright/test'

/**
 * 테스트별 격리 사장 + 인증 페이지 (영업상태 전이 등 stateful 케이스). ⚠️ createSeller=국세청 호출이라
 * 꼭 필요한 격리 케이스에만. 사용 후 반환된 close() 를 호출해 컨텍스트 정리.
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
  await loginSeller(context.request, seller.account.email, seller.account.password)
  const page = await context.newPage()
  await page.goto(TARGETS.seller + '/')
  return { seller, page, close: () => context.close() }
}
