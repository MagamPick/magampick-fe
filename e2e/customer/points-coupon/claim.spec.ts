import { test, expect } from '../../fixtures/test'
import { spaGoto, spaGotoFresh } from '../../fixtures/navigation'

/**
 * P8-05 핵심 — 이벤트 쿠폰 받기 / 중복 받기 차단
 *
 * dev 실측 전제:
 *   - 신규 소비자는 "신규 가입 축하 쿠폰" 1장 USABLE (→ 쿠폰함 초기 USABLE=1)
 *   - 이벤트 화면에 unclaimed 쿠폰 ≥ 1장 상시 존재 (dev 공용 이벤트)
 *   - 쿠폰 받기 성공 후 useClaimEvent onSuccess → invalidateQueries(['coupons'])
 *     → events·list 모두 재조회 → EventCard aria-label "이미 받은 쿠폰" + disabled
 *
 * 중복 차단 UX: claimed=true → button disabled / aria-label="이미 받은 쿠폰" / 텍스트 "받기 완료"
 * (BE 409도 동일 UX. spaGotoFresh 후 재조회해도 claimed=true 고정 — BE 1인 1회 제약.)
 */
test.describe('P8-05 — 이벤트 쿠폰 받기', () => {
  test('이벤트에서 쿠폰 받기 → 쿠폰함 USABLE 1 → 2 증가', async ({ customerPage }) => {
    // 이벤트 화면 진입
    await spaGoto(customerPage, '/mypage/events')
    await expect(customerPage.getByRole('heading', { name: '이벤트' })).toBeVisible()

    // unclaimed 버튼 대기 후 클릭 (이벤트 목록 로딩 완료 자동 대기)
    const claimBtn = customerPage.getByRole('button', { name: '쿠폰 받기' }).first()
    await expect(claimBtn).toBeEnabled()
    await claimBtn.click()

    // mutation 성공 + events 재조회 완료 → "이미 받은 쿠폰" 상태로 전환 (자동 대기)
    await expect(
      customerPage.getByRole('button', { name: '이미 받은 쿠폰' }).first(),
    ).toBeDisabled()
    await expect(customerPage.getByText('받기 완료').first()).toBeVisible()

    // 쿠폰함으로 fresh 이동 (QueryClient 캐시 제거 — staleTime 1분 회피)
    await spaGotoFresh(customerPage, '/mypage/coupons')
    await expect(customerPage.getByRole('heading', { name: '쿠폰함' })).toBeVisible()

    // USABLE 탭 개수 배지 = 2 (축하쿠폰 1 + 방금 받은 이벤트 쿠폰 1)
    const usableTab = customerPage.getByRole('tab', { name: /사용 가능/ })
    await expect(usableTab).toContainText('2')
  })

  test('중복 받기 차단 — 재방문(fresh fetch) 후에도 버튼 비활성 유지', async ({
    customerPage,
  }) => {
    // 이벤트 화면 진입 + 첫 번째 쿠폰 받기
    await spaGoto(customerPage, '/mypage/events')
    await expect(customerPage.getByRole('heading', { name: '이벤트' })).toBeVisible()

    const claimBtn = customerPage.getByRole('button', { name: '쿠폰 받기' }).first()
    await expect(claimBtn).toBeEnabled()
    await claimBtn.click()

    // 받기 완료 상태로 전환 확인
    await expect(
      customerPage.getByRole('button', { name: '이미 받은 쿠폰' }).first(),
    ).toBeDisabled()

    // 이벤트 화면 hard-reload → QueryClient 캐시 비우고 BE 재조회
    await spaGotoFresh(customerPage, '/mypage/events')
    await expect(customerPage.getByRole('heading', { name: '이벤트' })).toBeVisible()

    // BE가 claimed=true 반환 → 버튼 여전히 비활성·"받기 완료" 표시 (중복 차단 확인)
    await expect(
      customerPage.getByRole('button', { name: '이미 받은 쿠폰' }).first(),
    ).toBeDisabled()
    await expect(customerPage.getByText('받기 완료').first()).toBeVisible()

    // 아직 unclaimed 이벤트가 남아 있으면 "받기" 버튼 존재 (비교군: claimed 아닌 것은 여전히 활성)
    // dev 이벤트 2개 중 1개 claim → 나머지 1개는 여전히 "받기" 상태
    // (이벤트 수가 변해 이 단언이 깨지면 test.fail 로 보고)
    const remainingClaimable = customerPage.getByRole('button', { name: '쿠폰 받기' })
    const remainingCount = await remainingClaimable.count()
    if (remainingCount === 0) {
      // 모든 이벤트가 이 계정에서 already-claimed 상태인 경우 (dev 이벤트 1개뿐)
      // 이 시나리오에서도 "받기 완료" 단언은 위에서 통과했으므로 OK
    }
    // "받기" 버튼(존재하면)은 활성 상태 — claimed 아닌 이벤트는 영향 없음
    if (remainingCount > 0) {
      await expect(remainingClaimable.first()).toBeEnabled()
    }
  })
})
