/**
 * P5-08 ~ P5-13 사장 주문 상태 전이 E2E
 *
 * 커버리지:
 *   P5-08  PENDING  → 주문 수락         → PREPARING  (배너·CTA 전환)
 *   P5-09  PENDING  → 주문 거절 (확인)  → REJECTED   (취소·환불 세그먼트)
 *   P5-10  PREPARING → 준비 완료로 변경 → READY → 수령 완료 처리 → COMPLETED
 *   P5-11  READY    → 픽업 코드 UI 확인 → 수령 완료 처리 → COMPLETED
 *   P5-12  READY    → 잘못된 코드 입력 → 검증 오류 [미구현 — test.fail]
 *   P5-13  READY    → 미수령 처리 (확인) → NO_SHOW   (취소·환불 세그먼트)
 *
 * 원칙:
 *   - page.route 목킹 없음 — dev BE(api.dev.magampick.com) 실연동
 *   - apps/ 소스 수정 없음
 *   - 각 테스트가 고유 상품/떨이/소비자/주문을 시드 → 병렬 안전
 *   - 사장 앱: spaGotoFresh 금지(하드 리로드 = 로그아웃) → spaGoto 만 사용
 *   - 전이 검증은 주문 상세 페이지(OrderDetailPage)에서 진행
 *     — 상세는 orderId 만으로 직접 접근 가능, currentStoreStore 없어도 fetch 정상 동작
 */

import { test, expect } from '../../fixtures/seller-test'
import { seedProduct, seedClearance } from '../../fixtures/seller'
import { seedOrder } from '../../fixtures/order'
import { uniqueCustomer } from '../../fixtures/data'
import { createCustomer, customerIdOf } from '../../fixtures/api'
import { spaGoto } from '../../fixtures/navigation'
import { request } from '@playwright/test'

/** 상품 → 떨이 → 소비자 계정 → 주문 시드 (각 테스트가 고유 주문을 격리). */
async function seedFlow(
  token: string,
  storeId: number,
  targetState: 'PENDING' | 'PREPARING' | 'READY',
) {
  const pid = await seedProduct(token, storeId, { name: `상품${Date.now()}` })
  const ci = await seedClearance(token, storeId, pid, { totalQuantity: 5 })
  const api = await request.newContext()
  const c = uniqueCustomer()
  await createCustomer(api, c)
  const customerId = await customerIdOf(c)
  await api.dispose()
  return seedOrder({ targetState, customerId, storeId, clearanceItemId: ci })
}

test.describe('P5 사장 주문 상태 전이', () => {
  /**
   * P5-08: PENDING → 주문 수락 → PREPARING
   *
   * 상세 CTA [주문 수락] 클릭 → 배너가 "신규 주문"→"준비중" 으로, CTA 가 "준비 완료로 변경" 으로 전환.
   */
  test('P5-08: PENDING → 주문 수락 → 준비중 전환', async ({ seller, sellerPage }) => {
    test.setTimeout(120_000)

    const order = await seedFlow(seller.token, seller.store.id, 'PENDING')
    await spaGoto(sellerPage, `/orders/${order.orderId}`)

    // PENDING 상태 확인
    await expect(sellerPage.getByText('신규 주문')).toBeVisible({ timeout: 15_000 })
    await expect(sellerPage.getByRole('button', { name: '주문 수락' })).toBeVisible()

    // 수락
    await sellerPage.getByRole('button', { name: '주문 수락' }).click()

    // PREPARING 전환 확인
    await expect(sellerPage.getByText('준비중')).toBeVisible({ timeout: 15_000 })
    await expect(sellerPage.getByRole('button', { name: '준비 완료로 변경' })).toBeVisible()
    await expect(sellerPage.getByRole('button', { name: '주문 수락' })).not.toBeVisible()
  })

  /**
   * P5-09: PENDING → 거절 확인 → REJECTED [test.fail — dev 시드 주문 자동환불 불가]
   *
   * ★ 현재 동작: "주문 거절" 확인 후 ConfirmSheet 가 닫히지 않고 "매장 거절" 배너 미전환.
   *
   * 원인: POST /seller/orders/{id}/reject 는 BE 에서 Toss 자동환불을 트리거한다.
   * /dev/test/orders 시드 주문은 실 Toss paymentKey 없이 즉석 생성 되므로 BE 환불 처리
   * 실패 → 4xx 응답 → FE mutation onError → setSheet(null) 미호출 → ConfirmSheet 잔류.
   *
   * 해결: 실 결제주문(Vercel Preview + 토스 샌드박스 E2E)에서만 검증 가능. 현 dev 시드 환경
   * 한계로 expected failure 처리.
   */
  test('P5-09: PENDING → 거절 확인 → 매장 거절 전환', async ({ seller, sellerPage }) => {
    test.setTimeout(120_000)
    test.fail(
      true,
      'P5-09: reject mutation 이 BE 자동환불(Toss) 실패로 오류 반환 → ConfirmSheet 닫히지 않음.' +
        ' /dev/test/orders 시드 주문은 실 Toss paymentKey 없이 생성되어 환불 불가 → BE 4xx → mutation error.' +
        ' 실 결제주문(Vercel Preview + 토스 샌드박스 E2E)으로만 검증 가능.',
    )

    const order = await seedFlow(seller.token, seller.store.id, 'PENDING')
    await spaGoto(sellerPage, `/orders/${order.orderId}`)

    // PENDING 상태 확인
    await expect(sellerPage.getByText('신규 주문')).toBeVisible({ timeout: 15_000 })
    await expect(sellerPage.getByRole('button', { name: '거절' })).toBeVisible()

    // 거절 → ConfirmSheet
    await sellerPage.getByRole('button', { name: '거절' }).click()
    await expect(sellerPage.getByRole('heading', { name: '주문을 거절할까요?' })).toBeVisible()

    // 거절 확인
    await sellerPage.getByRole('button', { name: '주문 거절' }).click()

    // 원하는 동작: REJECTED 전환 확인 (실 결제주문에서만 통과)
    await expect(sellerPage.getByText('매장 거절')).toBeVisible({ timeout: 15_000 })
    await expect(sellerPage.getByText('처리할 작업이 없어요')).toBeVisible()
  })

  /**
   * P5-10: PREPARING → 준비 완료로 변경 → READY(픽업 코드) → 수령 완료 처리 → COMPLETED
   *
   * 연속 두 전이:
   * [준비 완료로 변경] → "준비완료" 배너 + 픽업 인증 코드 강조 확인
   * → [수령 완료 처리] → "픽업 완료" + 작업 없음.
   */
  test('P5-10: PREPARING → 준비 완료로 변경 → 픽업 코드 노출 → 수령 완료', async ({ seller, sellerPage }) => {
    test.setTimeout(120_000)

    const order = await seedFlow(seller.token, seller.store.id, 'PREPARING')
    await spaGoto(sellerPage, `/orders/${order.orderId}`)

    // PREPARING 상태 확인
    await expect(sellerPage.getByText('준비중')).toBeVisible({ timeout: 15_000 })
    await expect(sellerPage.getByRole('button', { name: '준비 완료로 변경' })).toBeVisible()

    // 준비 완료로 변경
    await sellerPage.getByRole('button', { name: '준비 완료로 변경' }).click()

    // READY 전환: 배너 준비완료 + 픽업 코드 강조 표시
    await expect(sellerPage.getByText('준비완료')).toBeVisible({ timeout: 15_000 })
    await expect(sellerPage.getByText('픽업 인증 코드')).toBeVisible()
    await expect(sellerPage.getByText(order.pickupCode)).toBeVisible()
    await expect(
      sellerPage.getByText('고객에게 이 코드를 확인하고 픽업을 완료하세요'),
    ).toBeVisible()

    // 수령 완료 처리
    await sellerPage.getByRole('button', { name: '수령 완료 처리' }).click()

    // COMPLETED 전환 확인
    await expect(sellerPage.getByText('픽업 완료')).toBeVisible({ timeout: 15_000 })
    await expect(sellerPage.getByText('처리할 작업이 없어요')).toBeVisible()
  })

  /**
   * P5-11: READY → 픽업 코드 UI 표시 확인 → 수령 완료 처리 → COMPLETED
   *
   * 시드된 픽업 코드가 상세 화면에 표시(강조 border/색)되고,
   * [수령 완료 처리] 클릭 후 픽업 완료 터미널 상태로 전환.
   */
  test('P5-11: READY → 픽업 코드 표시 확인 → 수령 완료', async ({ seller, sellerPage }) => {
    test.setTimeout(120_000)

    const order = await seedFlow(seller.token, seller.store.id, 'READY')
    await spaGoto(sellerPage, `/orders/${order.orderId}`)

    // READY 상태: 픽업 코드 강조 + 안내 문구
    await expect(sellerPage.getByText('준비완료')).toBeVisible({ timeout: 15_000 })
    await expect(sellerPage.getByText('픽업 인증 코드')).toBeVisible()
    // 시드된 픽업 코드가 UI 에 표시되는지 확인 (seed → BE → FE pickupCode 일치)
    await expect(sellerPage.getByText(order.pickupCode)).toBeVisible()

    // 수령 완료 처리
    await sellerPage.getByRole('button', { name: '수령 완료 처리' }).click()

    // COMPLETED 전환 확인
    await expect(sellerPage.getByText('픽업 완료')).toBeVisible({ timeout: 15_000 })
    await expect(sellerPage.getByText('처리할 작업이 없어요')).toBeVisible()
  })

  /**
   * P5-12: "잘못된 픽업 코드 거부" — ★**설계상 N/A** (findings A4-1, 사용자 확인·닫음).
   * 픽업 코드는 **느슨한 식별/표시 전용**이고 수령완료가 코드를 서버로 보내지 않아(코드 검증 게이트 부재)
   * "잘못된 코드 입력 → 거부"는 구현 대상이 아니다(버그 아님, 의도된 설계). 여기선 그 설계를 고정한다:
   * READY 상세에 픽업 코드가 **표시**되되 **코드 입력 필드는 없다**.
   */
  test('P5-12: 픽업코드는 표시 전용 — 코드 입력 검증 게이트 없음 (A4-1 의도됨)', async ({
    seller,
    sellerPage,
  }) => {
    test.setTimeout(120_000)
    const order = await seedFlow(seller.token, seller.store.id, 'READY')
    await spaGoto(sellerPage, `/orders/${order.orderId}`)
    await expect(sellerPage.getByText('준비완료')).toBeVisible({ timeout: 15_000 })
    // 픽업코드(4자리)가 표시된다 — PickupCodeCard
    await expect(sellerPage.getByText(order.pickupCode)).toBeVisible()
    // 코드 입력 필드는 없다(서버 검증 게이트 부재 = 느슨한 식별 설계)
    await expect(sellerPage.getByPlaceholder(/코드/)).toHaveCount(0)
  })

  /**
   * P5-13: READY → 미수령 처리 확인 → NO_SHOW
   *
   * [미수령] → ConfirmSheet "미수령 처리할까요?" → [미수령 처리] 확인
   * → 터미널 상태: "처리할 작업이 없어요" + READY CTA 버튼 소멸.
   */
  test('P5-13: READY → 미수령 처리 → NO_SHOW 전환', async ({ seller, sellerPage }) => {
    test.setTimeout(120_000)

    const order = await seedFlow(seller.token, seller.store.id, 'READY')
    await spaGoto(sellerPage, `/orders/${order.orderId}`)

    // READY 상태 확인
    await expect(sellerPage.getByText('준비완료')).toBeVisible({ timeout: 15_000 })
    await expect(sellerPage.getByRole('button', { name: '미수령' })).toBeVisible()
    await expect(sellerPage.getByRole('button', { name: '수령 완료 처리' })).toBeVisible()

    // 미수령 → ConfirmSheet
    await sellerPage.getByRole('button', { name: '미수령' }).click()
    await expect(sellerPage.getByRole('heading', { name: '미수령 처리할까요?' })).toBeVisible()

    // 미수령 처리 확인
    await sellerPage.getByRole('button', { name: '미수령 처리' }).click()

    // NO_SHOW 전환 확인: 터미널 표시 + READY CTA 소멸
    await expect(sellerPage.getByText('처리할 작업이 없어요')).toBeVisible({ timeout: 15_000 })
    await expect(sellerPage.getByRole('button', { name: '미수령' })).not.toBeVisible()
    await expect(sellerPage.getByRole('button', { name: '수령 완료 처리' })).not.toBeVisible()
  })
})
