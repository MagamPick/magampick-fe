import { request, type Browser, type Page } from '@playwright/test'
import { SEED_GPS, TARGETS } from './env'
import { createCustomer, login } from './api'
import { uniqueCustomer, type CustomerAccount } from './data'

/**
 * cross-app journey 용 헬퍼 — 한 테스트에서 소비자/사장 등 여러 앱 컨텍스트를 직접 연다.
 * (journeys 프로젝트는 baseURL 미지정 → 컨텍스트별로 앱 origin·옵션을 직접 설정.)
 *
 * 소비자: 쿠키 주입(customer 는 AuthBootstrap 있음). 사장: `seller-test.openFreshSellerPage`(UI 로그인).
 */
export { openFreshSellerPage } from './seller-test'

/** 새 소비자 + 인증 부팅된 customer 앱 페이지 (격리). close() 로 컨텍스트 정리. */
export async function openFreshCustomerPage(
  browser: Browser,
): Promise<{ account: CustomerAccount; page: Page; close: () => Promise<void> }> {
  const account = uniqueCustomer()
  const api = await request.newContext()
  try {
    await createCustomer(api, account)
  } finally {
    await api.dispose()
  }
  const context = await browser.newContext({
    baseURL: TARGETS.customer,
    locale: 'ko-KR',
    timezoneId: 'Asia/Seoul',
    viewport: { width: 393, height: 852 },
    permissions: ['geolocation'],
    geolocation: SEED_GPS,
  })
  await login(context.request, account.email, account.password) // refresh 쿠키 → context 자
  const page = await context.newPage()
  await page.goto(TARGETS.customer + '/') // AuthBootstrap silent refresh
  return { account, page, close: () => context.close() }
}
