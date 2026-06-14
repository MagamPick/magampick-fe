import { test as base, type Page } from '@playwright/test'
import { TARGETS } from './env'
import { loginAdmin } from './api'

/**
 * 관리자 앱 E2E fixtures (admin 프로젝트, baseURL=admin.dev.magampick.com, 데스크톱 웹).
 *
 * - `adminPage` : 관리자로 인증 부팅된 admin 페이지. admin 은 customer 처럼 AuthBootstrap(부팅 silent
 *   refresh)이 있어 **쿠키 주입**으로 인증된다(UI 로그인 불필요). 단일 공유 계정이라 격리 불가 →
 *   생성 엔티티는 유니크 네이밍으로 충돌 방지(스펙 책임).
 */
export const test = base.extend<{ adminPage: Page }>({
  adminPage: async ({ context, page }, use) => {
    await loginAdmin(context.request) // refresh 쿠키 → context 자
    await page.goto(TARGETS.admin + '/') // AuthBootstrap 가 access 복구
    await use(page)
  },
})

export { expect } from '@playwright/test'
