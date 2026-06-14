/**
 * 문의 관리 (P11-06) E2E — admin.dev.magampick.com.
 *
 * 시드 전략 (데이터 격리):
 *   각 테스트가 소비자 계정을 즉석 생성 → POST /customers/me/inquiries 로 PENDING 문의 생성.
 *   유니크 제목으로 admin 목록에서 해당 문의를 식별 — 공유 시드 문의를 답변하면 다른 테스트 오염.
 *
 * 커버 (qa-checklist P11-06):
 *   1. PENDING 문의가 admin 목록에 표시됨
 *   2. PENDING 문의에 답변 등록 → 답변완료 읽기전용 전환
 *   3. ANSWERED 문의는 재답변 입력 UI 없음 (답변 내용 + 닫기만)
 *   4. 상태 필터 동작 (대기 선택 시 answered 배지 없음)
 */
import type { APIRequestContext, Page } from '@playwright/test'
import { test, expect } from '../../fixtures/admin-test'
import { spaGotoFresh } from '../../fixtures/navigation'
import { uniqueCustomer } from '../../fixtures/data'
import { createCustomer, login, loginAdmin } from '../../fixtures/api'
import { API_V1 } from '../../fixtures/env'

// ── 시드 헬퍼 ─────────────────────────────────────────────────────────────────

/** 테스트별 전역 유일 문의 제목 */
function uniqueTitle(tag = ''): string {
  const stamp = Date.now().toString(36)
  const rand = Math.random().toString(36).slice(2, 6)
  return `e2e-inq-${stamp}-${rand}${tag ? `-${tag}` : ''}`
}

/**
 * 소비자 계정 즉석 생성 + PENDING 문의 제출 → 생성된 문의 id 반환.
 * 제목 2자↑ / 내용 10자↑ (supportApi inquiryInputSchema 계약).
 */
async function seedPendingInquiry(api: APIRequestContext, title: string): Promise<number> {
  const acct = uniqueCustomer()
  await createCustomer(api, acct)
  const { accessToken } = await login(api, acct.email)
  const res = await api.post(`${API_V1}/customers/me/inquiries`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    data: {
      category: 'order',
      title,
      content: 'E2E 자동 생성 테스트 문의입니다.',
    },
  })
  if (!res.ok()) {
    throw new Error(`[seed] 문의 생성 실패 ${res.status()}: ${await res.text()}`)
  }
  const body = (await res.json()) as { data?: { id?: number } }
  const id = body.data?.id
  if (!id) throw new Error(`[seed] 문의 id 없음: ${JSON.stringify(body)}`)
  return id
}

/**
 * Radix Select(상태 필터) 선택 헬퍼.
 * SelectTrigger = role="combobox" aria-label="상태 필터" / SelectItem = role="option".
 */
async function applyStatusFilter(page: Page, optionLabel: string): Promise<void> {
  await page.getByRole('combobox', { name: '상태 필터' }).click()
  await page.getByRole('option', { name: optionLabel }).click()
}

// ── 스펙 ───────────────────────────────────────────────────────────────────────

test.describe('문의 관리 (P11-06)', () => {
  // ── 1. 목록 표시 ───────────────────────────────────────────────────────────
  test('시드한 PENDING 문의가 admin 목록에 표시된다', async ({ adminPage, playwright }) => {
    const title = uniqueTitle('visible')

    const api = await playwright.request.newContext()
    try {
      await seedPendingInquiry(api, title)
    } finally {
      await api.dispose()
    }

    // 시드 후 캐시 비우기(spaGotoFresh) → PENDING 필터로 목록 축소
    await spaGotoFresh(adminPage, '/inquiries')
    await applyStatusFilter(adminPage, '답변 대기')

    await expect(adminPage.getByText(title)).toBeVisible({ timeout: 15_000 })
  })

  // ── 2. 답변 등록 → 읽기전용 전환 ────────────────────────────────────────────
  test('PENDING 문의에 답변 등록 → 다이얼로그가 답변완료 읽기전용으로 전환된다', async ({
    adminPage,
    playwright,
  }) => {
    const title = uniqueTitle('answer')

    const api = await playwright.request.newContext()
    try {
      await seedPendingInquiry(api, title)
    } finally {
      await api.dispose()
    }

    await spaGotoFresh(adminPage, '/inquiries')
    await applyStatusFilter(adminPage, '답변 대기')
    await expect(adminPage.getByText(title)).toBeVisible({ timeout: 15_000 })

    // 행(role="button", aria-label="${title} 문의 열기") 클릭 → 답변 다이얼로그
    await adminPage.getByRole('button', { name: `${title} 문의 열기` }).click()
    const dialog = adminPage.getByRole('dialog')
    await expect(dialog).toBeVisible()
    // DialogTitle(h2) = 문의 제목
    await expect(dialog.getByRole('heading', { name: title })).toBeVisible()
    // PENDING → 입력 폼 있음
    const textarea = dialog.getByRole('textbox', { name: '답변 작성' })
    await expect(textarea).toBeVisible()

    // 답변 작성 + 제출
    const answerContent = 'E2E 테스트 답변입니다. 자동 검증 완료.'
    await textarea.fill(answerContent)
    await dialog.getByRole('button', { name: '답변 등록' }).click()

    // 성공 → answered 읽기전용 뷰 전환 (useAnswerInquiry.data 로 갱신)
    await expect(dialog.getByText(answerContent)).toBeVisible({ timeout: 15_000 })
    // 폼 및 제출 버튼 사라짐
    await expect(dialog.getByRole('textbox')).toBeHidden()
    await expect(dialog.getByRole('button', { name: '답변 등록' })).toBeHidden()
    // 닫기 버튼 있음 (Radix DialogClose X 버튼도 "닫기" 이름을 가져 strict 위반 → first() 로 컨텐츠 버튼 지정)
    await expect(dialog.getByRole('button', { name: '닫기' }).first()).toBeVisible()
  })

  // ── 3. ANSWERED → 재답변 UI 없음 ─────────────────────────────────────────
  test('ANSWERED 문의는 재답변 입력 UI 없이 답변 내용만 읽기전용으로 표시된다', async ({
    adminPage,
    playwright,
  }) => {
    const title = uniqueTitle('answered')
    const presetAnswer = 'API 사전 답변 — 재답변 차단 확인용입니다.'

    const api = await playwright.request.newContext()
    try {
      // PENDING 문의 생성
      const id = await seedPendingInquiry(api, title)
      // admin API 로 직접 답변 → ANSWERED 상태 조성
      const { accessToken: adminToken } = await loginAdmin(api)
      const answerRes = await api.post(`${API_V1}/admin/inquiries/${id}/answer`, {
        headers: { Authorization: `Bearer ${adminToken}` },
        data: { content: presetAnswer },
      })
      if (!answerRes.ok()) {
        throw new Error(`[seed] admin 답변 실패 ${answerRes.status()}: ${await answerRes.text()}`)
      }
    } finally {
      await api.dispose()
    }

    // 답변완료 필터로 좁힘 (PENDING 보다 뒤에 정렬돼 페이지네이션 이탈 방지)
    await spaGotoFresh(adminPage, '/inquiries')
    await applyStatusFilter(adminPage, '답변 완료')
    await expect(adminPage.getByText(title)).toBeVisible({ timeout: 15_000 })

    // 행 클릭 → 다이얼로그
    await adminPage.getByRole('button', { name: `${title} 문의 열기` }).click()
    const dialog = adminPage.getByRole('dialog')
    await expect(dialog).toBeVisible()

    // 재답변 입력 UI 없음 — textarea·"답변 등록" 버튼 부재
    await expect(dialog.getByRole('textbox')).toBeHidden()
    await expect(dialog.getByRole('button', { name: '답변 등록' })).toBeHidden()
    // 사전 답변 내용 표시
    await expect(dialog.getByText(presetAnswer)).toBeVisible()
    // 닫기 버튼 있음 (Radix DialogClose X 버튼도 "닫기" 이름 → first() 로 컨텐츠 버튼 지정)
    await expect(dialog.getByRole('button', { name: '닫기' }).first()).toBeVisible()
  })

  // ── 4. 상태 필터 동작 ────────────────────────────────────────────────────
  test('상태 필터 — 대기 선택 시 목록 내 "답변 완료" 배지가 없다', async ({
    adminPage,
    playwright,
  }) => {
    const title = uniqueTitle('filter')

    const api = await playwright.request.newContext()
    try {
      await seedPendingInquiry(api, title)
    } finally {
      await api.dispose()
    }

    await spaGotoFresh(adminPage, '/inquiries')
    await applyStatusFilter(adminPage, '답변 대기')
    await expect(adminPage.getByText(title)).toBeVisible({ timeout: 15_000 })

    // 테이블 내 "답변 완료" 배지(data-status="answered") 없어야 함
    // Radix SelectContent 는 드롭다운 닫히면 DOM 에서 제거돼 option "답변 완료" 간섭 없음
    const table = adminPage.locator('table')
    await expect(table.locator('[data-status="answered"]')).toHaveCount(0)
  })
})
