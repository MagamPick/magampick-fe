import { test as base, type Page } from '@playwright/test'
import { TARGETS } from './env'
import { createCustomer, login } from './api'
import { uniqueCustomer, type CustomerAccount } from './data'

/**
 * 마감픽 E2E 공용 fixtures.
 *
 * - `customer`     : 테스트마다 dev 에 새로 가입한 소비자 계정 (데이터 격리). 가입 직후 기본 주소 1개 보유.
 * - `customerPage` : 그 소비자로 인증된 customer 앱 페이지. refresh 쿠키를 BrowserContext 에 심고
 *                    page.goto → AuthBootstrap silent refresh 로 인증 부팅 (UI 로그인 불필요).
 *
 * 인증 원리: 로그인 응답의 refresh_token 쿠키(SameSite=None;Secure;Path=/api/v1/auth, domain
 * api.dev.magampick.com)를 BrowserContext.request 로그인으로 컨텍스트 쿠키 자에 적재. FE(dev.magampick.com)
 * 와 BE 가 same-site 라 브라우저가 /auth/refresh XHR 에 쿠키를 자동 동봉 → 새 access 토큰 발급.
 */
export const test = base.extend<{
  customer: CustomerAccount
  customerPage: Page
}>({
  customer: async ({ playwright }, use) => {
    // 계정 생성은 별도 request 컨텍스트로 (브라우저 컨텍스트 쿠키와 분리)
    const api = await playwright.request.newContext()
    const acct = uniqueCustomer()
    await createCustomer(api, acct)
    await api.dispose()
    await use(acct)
    // 정리: dev 공유 DB 라 계정 즉시 삭제 API 없음 → `qa.%` cleanup(SQL)이 일괄 회수
  },

  customerPage: async ({ context, customer }, use) => {
    // BrowserContext.request 로 로그인 → refresh_token 쿠키가 이 컨텍스트 쿠키 자에 적재됨
    await login(context.request, customer.email, customer.password)
    const page = await context.newPage()
    await page.goto(TARGETS.customer + '/') // AuthBootstrap 가 쿠키로 access 복구
    await use(page)
  },
})

export { expect } from '@playwright/test'
