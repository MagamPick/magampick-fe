import { test, expect, type Page } from '@playwright/test'
import { TARGETS, ADMIN_USERNAME, ADMIN_PASSWORD } from '../../fixtures/env'

/**
 * 관리자 로그인 화면/흐름 E2E (admin 프로젝트 — Desktop Chrome, baseURL = admin.dev.magampick.com).
 *
 * deep-link 제약: Vercel 배포에 SPA catch-all rewrite 없음 → 직접 /login goto 는 404.
 * 루트(/) 로 진입하면 AuthBootstrap 이 silent refresh(실패 → 쿠키 없음) 후 라우터를 렌더하고
 * ProtectedRoute 가 클라이언트에서 /login 으로 리다이렉트한다.
 *
 * 각 테스트는 base test(page) 사용 — 쿠키 없는 미인증 컨텍스트에서 출발.
 */

/** 루트 진입 → AuthBootstrap silent refresh → ProtectedRoute → /login 폼 표시 대기 */
async function gotoLoginForm(page: Page): Promise<void> {
  await page.goto(TARGETS.admin + '/')
  // AuthBootstrap 이 /auth/refresh 를 시도하고 실패한 뒤 라우터를 렌더한다.
  // ProtectedRoute 가 isAuthenticated=false 를 보고 /login 으로 Navigate 한다.
  await expect(page.getByRole('button', { name: '로그인' })).toBeVisible()
}

test.describe('관리자 로그인 — 화면 렌더', () => {
  test('루트 진입 시 미인증이면 로그인 폼이 표시된다', async ({ page }) => {
    await gotoLoginForm(page)

    // 제목 (h1: "마감픽 관리자") 과 부제목
    await expect(page.getByRole('heading', { name: /마감픽/ })).toBeVisible()
    await expect(page.getByText('운영 관리 콘솔')).toBeVisible()

    // 입력 필드
    await expect(page.getByLabel('아이디')).toBeVisible()
    await expect(page.getByLabel('비밀번호')).toBeVisible()

    // 가입·비번찾기·소셜 진입점 없음
    await expect(page.getByText('회원가입')).not.toBeVisible()
    await expect(page.getByText('비밀번호 찾기')).not.toBeVisible()
  })
})

test.describe('관리자 로그인 — 실패', () => {
  test('잘못된 자격증명 입력 시 에러 메시지가 표시되고 미인증이 유지된다', async ({ page }) => {
    await gotoLoginForm(page)

    await page.getByLabel('아이디').fill('wrong_user_xyz')
    await page.getByLabel('비밀번호').fill('wrong_pass_xyz')
    await page.getByRole('button', { name: '로그인' }).click()

    // 서버 401 → role="alert" 단일 문구
    await expect(page.getByRole('alert')).toContainText('아이디 또는 비밀번호를 확인해주세요')
    // 미인증 유지 — 폼이 여전히 표시됨
    await expect(page.getByRole('button', { name: '로그인' })).toBeVisible()
  })
})

test.describe('관리자 로그인 — 성공', () => {
  test('올바른 자격증명으로 로그인 시 이벤트 관리 화면으로 이동한다', async ({ page }) => {
    await gotoLoginForm(page)

    await page.getByLabel('아이디').fill(ADMIN_USERNAME)
    await page.getByLabel('비밀번호').fill(ADMIN_PASSWORD)
    await page.getByRole('button', { name: '로그인' }).click()

    // 인증 성공 → PublicOnlyRoute 가 /events 로 Navigate
    await expect(page).toHaveURL(/\/events/)
    // AdminShell 사이드바 네비 표시 (로그인 성공 확인)
    await expect(page.getByRole('link', { name: '이벤트' })).toBeVisible()
    // 로그인 폼 사라짐
    await expect(page.getByRole('button', { name: '로그인' })).not.toBeVisible()
  })
})

test.describe('관리자 로그인 — 빈 필드 클라이언트 검증', () => {
  test('아이디·비밀번호 미입력 제출 시 필수 입력 안내가 표시된다', async ({ page }) => {
    await gotoLoginForm(page)

    // 비어있는 상태에서 제출 → Zod min(1) 검증
    await page.getByRole('button', { name: '로그인' }).click()

    await expect(page.getByText('아이디를 입력해주세요')).toBeVisible()
    await expect(page.getByText('비밀번호를 입력해주세요')).toBeVisible()
  })
})
