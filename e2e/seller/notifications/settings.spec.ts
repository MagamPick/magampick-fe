import { test, expect } from '../../fixtures/seller-test'
import { spaGoto } from '../../fixtures/navigation'

/**
 * P7-02 사장 알림 설정 토글
 *
 * 신규 사장 기준 기본값:
 *   - 신규 주문·주문 취소·환불 요청·신규 리뷰: ON
 *   - 마케팅 정보: OFF
 *   - 공지(notice): 명세 미지정 — 기본값 단언 생략
 *
 * 토글 흐름:
 *   1. 낙관적 업데이트 (Switch 즉시 전환)
 *   2. PATCH /seller/notification-settings/{key} { enabled }
 *   3. onSettled → invalidateQueries(settings) → GET /seller/notification-settings 재조회
 *   4. SPA 네비로 remount 후 상태 유지 확인 (리로드 없이)
 *
 * ★ test.describe.configure({ mode: 'serial' }): worker-scoped 사장 공유 → 기본값 확인 먼저.
 * ★ spaGotoFresh 금지 — 사장 앱은 하드 리로드 시 로그아웃됨.
 */
test.describe('P7-02 사장 알림 설정', () => {
  test.describe.configure({ mode: 'serial' })

  test('설정 화면이 렌더되고 안내문·6종 토글이 표시된다', async ({ sellerPage }) => {
    await spaGoto(sellerPage, '/mypage/notifications')

    await expect(sellerPage.getByRole('heading', { name: '알림 설정' })).toBeVisible()
    // NotificationSettingsPage 안내문
    await expect(sellerPage.getByText('받고 싶은 알림만 켜두세요')).toBeVisible()

    // SELLER_SETTING_META 6종 Switch (aria-label={meta.label})
    for (const label of [
      '신규 주문',
      '주문 취소',
      '환불 요청',
      '신규 리뷰',
      '공지',
      '마케팅 정보',
    ]) {
      await expect(
        sellerPage.getByRole('switch', { name: label }),
        `${label} 토글이 보여야 한다`,
      ).toBeVisible()
    }
  })

  test('신규 사장 기본값 — 신규 주문·주문 취소·환불 요청·신규 리뷰 ON, 마케팅 정보 OFF', async ({
    sellerPage,
  }) => {
    await spaGoto(sellerPage, '/mypage/notifications')
    await expect(sellerPage.getByRole('heading', { name: '알림 설정' })).toBeVisible()

    for (const label of ['신규 주문', '주문 취소', '환불 요청', '신규 리뷰']) {
      await expect(
        sellerPage.getByRole('switch', { name: label }),
        `${label} 기본값이 ON이어야 한다`,
      ).toBeChecked()
    }

    await expect(
      sellerPage.getByRole('switch', { name: '마케팅 정보' }),
      '마케팅 정보 기본값이 OFF이어야 한다',
    ).not.toBeChecked()

    // 공지(notice) 기본값은 명세 미지정 — 단언 생략
  })

  test('마케팅 정보 토글 OFF→ON — PATCH 후 invalidate 재조회 반영, SPA 재진입 상태 유지', async ({
    sellerPage,
  }) => {
    await spaGoto(sellerPage, '/mypage/notifications')
    await expect(sellerPage.getByRole('heading', { name: '알림 설정' })).toBeVisible()

    const marketingSwitch = sellerPage.getByRole('switch', { name: '마케팅 정보' })
    // 사전 조건: 직전 기본값 테스트에서 확인된 기본 OFF
    await expect(marketingSwitch).not.toBeChecked()

    // ── 리스너 등록 (click 이전) ──────────────────────────────────────
    // PATCH /seller/notification-settings/marketing 완료 대기
    const patchDone = sellerPage.waitForResponse(
      (r) =>
        r.url().includes('/seller/notification-settings/marketing') &&
        r.request().method() === 'PATCH',
    )
    // onSettled invalidate 후 GET /seller/notification-settings 재조회 완료 대기
    const refetched = sellerPage.waitForResponse(
      (r) =>
        r.url().includes('/seller/notification-settings') &&
        !r.url().includes('/marketing') &&
        r.request().method() === 'GET',
    )

    // ── 토글 클릭 (낙관적 업데이트: Switch 즉시 ON) ──────────────────
    await marketingSwitch.click()

    // ── PATCH + 재조회 완료 ───────────────────────────────────────────
    await patchDone
    await refetched

    // invalidate 재조회 후 서버 상태 반영 — 리로드 없이
    await expect(marketingSwitch).toBeChecked()

    // ── SPA 네비로 remount 후 상태 유지 확인 ─────────────────────────
    await spaGoto(sellerPage, '/mypage')
    await spaGoto(sellerPage, '/mypage/notifications')
    await expect(sellerPage.getByRole('heading', { name: '알림 설정' })).toBeVisible()
    await expect(
      sellerPage.getByRole('switch', { name: '마케팅 정보' }),
      '재진입 후에도 ON 상태를 유지해야 한다',
    ).toBeChecked()

    // ── 정리: 기본값 복원 (마케팅 정보 → OFF) ───────────────────────
    const patchRevert = sellerPage.waitForResponse(
      (r) =>
        r.url().includes('/seller/notification-settings/marketing') &&
        r.request().method() === 'PATCH',
    )
    await sellerPage.getByRole('switch', { name: '마케팅 정보' }).click()
    await patchRevert
  })
})
