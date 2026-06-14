import type { Locator, Page } from '@playwright/test'
import { test, expect } from '../../fixtures/admin-test'
import { spaGoto } from '../../fixtures/navigation'

/**
 * P11-01 이벤트(쿠폰) 생성/관리 · B6-1 폼 교차검증 (validUntil ≥ displayEndAt)
 *
 * admin 프로젝트 (baseURL = admin.dev.magampick.com, Desktop Chrome).
 * adminPage fixture: 관리자 refresh 쿠키 주입 + AuthBootstrap silent refresh → 인증 부팅.
 * admin = 단일 공유 계정 → 생성 엔티티 라벨에 Date.now() suffix 로 병렬 충돌 방지.
 *
 * 날짜 픽 전제 — timezoneId: Asia/Seoul, dev today = 2026-06-14 (disabledBefore):
 *   June 2026 달력(Sunday-first) outside days = May 31 / Jul 1-11.
 *   20·25·30 은 June 전용 날짜 → outside day 와 겹치지 않는 안전한 픽.
 *
 * Popover(캘린더)는 Portal 경유 → page 레벨 locator 사용.
 * Dialog 내 버튼/입력은 dialog locator 스코프로 격리.
 */

// ─── 공통 헬퍼 ────────────────────────────────────────────────────────────────

/**
 * DateField 팝오버를 열고 달력에서 dayNumber 인 날을 클릭한다.
 * @param page       전체 page (Popover Portal 은 DOM 루트에 렌더)
 * @param scope      DateField 트리거를 포함하는 Locator (Dialog 내부)
 * @param ariaLabel  DateField trigger button 의 aria-label ("노출 시작일" 등)
 * @param dayNumber  클릭할 날짜 (1-31, 달력 표시 텍스트와 일치)
 */
async function pickDate(
  page: Page,
  scope: Locator,
  ariaLabel: string,
  dayNumber: number,
): Promise<void> {
  // 트리거 버튼 클릭 → Popover 팝업
  await scope.getByRole('button', { name: ariaLabel }).click()

  // Popover content (Portal) 가시화 대기
  const popover = page.locator('[data-slot="popover-content"]')
  await expect(popover).toBeVisible()

  // 달력 날 버튼: textContent = dayNumber (aria-label 은 전체 날짜 문자열 → hasText 로 매칭)
  await popover
    .locator('button')
    .filter({ hasText: new RegExp(`^${dayNumber}$`) })
    .first()
    .click()

  // DateField onSelect 에서 setOpen(false) → Popover 닫힘
  await expect(popover).not.toBeVisible()
}

// ─── P11-01 이벤트 생성·관리 ──────────────────────────────────────────────────

test.describe('P11-01 이벤트 생성·관리', () => {
  /**
   * 생성 → 목록 반영 → 조기종료 → 상태 "종료" 전환을 한 흐름으로 검증.
   * (두 스텝을 분리하면 첫 스텝에서 만든 이벤트 식별자를 두 번째 스텝이 공유하기 어려워 통합.)
   *
   * 검증 포인트:
   *   - POST /admin/coupons 201 → 목록 재조회 → 생성 이벤트 행 출현
   *   - POST /admin/coupons/{id}/end 200 → 목록 재조회 → 상태 배지 data-status="ended" 전환
   */
  test('이벤트 생성 → 목록 반영 → 조기종료 → 상태 종료', async ({ adminPage }) => {
    const label = `E2E 이벤트 ${Date.now()}`

    // ── 이벤트 관리 페이지 진입
    await spaGoto(adminPage, '/events')
    await expect(adminPage.getByRole('heading', { name: '이벤트 관리' })).toBeVisible()

    // ── 1. 생성 다이얼로그 열기
    await adminPage.getByRole('button', { name: '새 이벤트' }).click()
    const createDialog = adminPage.getByRole('dialog', { name: '새 이벤트' })
    await expect(createDialog).toBeVisible()

    // ── 2. 폼 입력
    // 라벨 — unique suffix 로 병렬 테스트 충돌 방지
    await createDialog.getByPlaceholder('예) 여름 마감 할인 쿠폰').fill(label)
    // 할인 종류: 기본값 RATE (aria-pressed="true") — 재클릭 불필요
    // 할인율 10%
    await createDialog.getByPlaceholder('1 ~ 100').fill('10')
    // 최소 주문 금액 0원 (기본값 '0' 유지) — exact: true 로 "1 ~ 100" / "예) 100" 부분매치 방지
    await createDialog.getByPlaceholder('0', { exact: true }).fill('0')
    // 무제한 발급 체크 (Radix Checkbox role="checkbox")
    await createDialog.getByRole('checkbox').click()

    // 날짜 3개: 노출 2026-06-20 ~ 2026-06-25, 쿠폰 만료 2026-06-30
    await pickDate(adminPage, createDialog, '노출 시작일', 20) // 2026-06-20
    await pickDate(adminPage, createDialog, '노출 종료일', 25) // 2026-06-25
    await pickDate(adminPage, createDialog, '쿠폰 만료일', 30) // 2026-06-30

    // ── 3. 제출 → API 성공 → 다이얼로그 닫힘
    await createDialog.getByRole('button', { name: '이벤트 생성' }).click()
    await expect(createDialog).not.toBeVisible()

    // ── 4. 목록에 생성 이벤트 반영 확인 (invalidateQueries → 재조회 완료 자동 대기)
    const row = adminPage.locator('tr').filter({ hasText: label })
    await expect(row).toBeVisible()

    // ── 5. 조기종료 트리거 (테이블 행의 "조기종료" 버튼)
    await row.getByRole('button', { name: '조기종료' }).click()
    const endDialog = adminPage.getByRole('dialog', { name: '이벤트 조기종료' })
    await expect(endDialog).toBeVisible()
    // EndEventDialog 에 이벤트 라벨 표시 확인
    await expect(endDialog.getByText(label)).toBeVisible()

    // ── 6. 조기종료 확인 → API 성공 → 다이얼로그 닫힘
    await endDialog.getByRole('button', { name: '조기종료' }).click()
    await expect(endDialog).not.toBeVisible()

    // ── 7. 상태 배지 "종료" (data-status="ended") 확인 (invalidateQueries → 재조회 완료 자동 대기)
    await expect(row.locator('[data-status="ended"]')).toBeVisible()
  })
})

// ─── B6-1 폼 교차검증 ─────────────────────────────────────────────────────────

test.describe('B6-1 폼 검증 — validUntil ≥ displayEndAt', () => {
  /**
   * validUntil(쿠폰 만료일) < displayEndAt(노출 종료일) 는 BE 미검증 → FE 폼이 유일 방어선.
   * 이 조건을 위반하면:
   *   - 폼이 제출을 차단해야 한다 (다이얼로그 유지)
   *   - "쿠폰 만료일은 노출 종료일 이후여야 해요" 에러 메시지가 표시되어야 한다
   *
   * 시나리오: displayEndAt=2026-06-30, validUntil=2026-06-25 (< displayEndAt) → 위반
   *
   * ⚠ 만약 이 검증이 실제 브라우저에서 막히지 않는다면 test.fail() 로 보고하고,
   *    원하는 동작(차단·에러 표시)을 assert 한 뒤 리포트에 기재한다.
   */
  test('validUntil < displayEndAt 이면 제출 차단 + 에러 메시지 표시', async ({ adminPage }) => {
    const label = `B6-1 테스트 ${Date.now()}`

    await spaGoto(adminPage, '/events')
    await expect(adminPage.getByRole('heading', { name: '이벤트 관리' })).toBeVisible()

    // ── 생성 다이얼로그 열기
    await adminPage.getByRole('button', { name: '새 이벤트' }).click()
    const dialog = adminPage.getByRole('dialog', { name: '새 이벤트' })
    await expect(dialog).toBeVisible()

    // ── 필수 필드 채우기
    await dialog.getByPlaceholder('예) 여름 마감 할인 쿠폰').fill(label)
    await dialog.getByPlaceholder('1 ~ 100').fill('10')
    await dialog.getByPlaceholder('0', { exact: true }).fill('0')
    await dialog.getByRole('checkbox').click() // 무제한 발급

    // 날짜: 노출 2026-06-20 ~ 2026-06-30, 만료 2026-06-25 (< displayEndAt → B6-1 위반)
    await pickDate(adminPage, dialog, '노출 시작일', 20) // 2026-06-20
    await pickDate(adminPage, dialog, '노출 종료일', 30) // 2026-06-30 (나중)
    await pickDate(adminPage, dialog, '쿠폰 만료일', 25) // 2026-06-25 < 30 → ERROR

    // ── 제출 시도 (form.handleSubmit → zodResolver 실패 → handleValid 미호출)
    await dialog.getByRole('button', { name: '이벤트 생성' }).click()

    // ── 에러 메시지 표시 확인
    const errorMsg = dialog.getByText('쿠폰 만료일은 노출 종료일 이후여야 해요')
    await expect(errorMsg).toBeVisible()

    // ── 다이얼로그 유지 확인 (제출 차단 증명)
    await expect(dialog).toBeVisible()
  })
})
