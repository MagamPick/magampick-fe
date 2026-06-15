import { test, expect } from '../../fixtures/test'
import { spaGotoFresh } from '../../fixtures/navigation'
import { createSeller, seedProduct, seedClearance } from '../../fixtures/seller'
import { seedOrder } from '../../fixtures/order'
import { customerIdOf } from '../../fixtures/api'

/**
 * P8-01 포인트 적립 — 픽업완료 주문 후 포인트 Hero 및 내역 표시 검증
 *
 * 적립 정책 (D1 — customer-points-pending-accrual-d1-done):
 *   - 픽업완료(COMPLETED) 즉시 EARN 트랜잭션 생성 → 포인트 내역에 기록
 *   - 환불 윈도우(3일) 종료 후 balance 확정; 그 전까지는 pendingPoints(아직 사용 불가)
 *
 * ⚠️ dev 실측 확인 결과 (2026-06-15):
 *   /dev/test/orders COMPLETED 주문이 포인트 적립 트리거를 하지 않음.
 *   → balance=0, pendingPoints=0, EARN 내역 없음 — BE 갭 (test.fail 마킹).
 *   BE 측 /dev/test/orders 가 포인트 도메인 이벤트(OrderCompleted)를 발행하도록 수정 필요.
 *   수정 후 test.fail() 제거하면 테스트 그대로 green.
 *
 * Hero 표시 패턴 (정상동작 시 기대값):
 *   - balance 표시: "{n} P"   (PointHero: <span>{n}</span> P → textContent "n P")
 *   - pendingPoints 표시: "+{n} P" (공백 포함, PointHero pendingPoints 카드)
 *   - 적립 내역 행: "+{n}P"   (공백 없음, PointHistoryRow span)
 *
 * page.route 변조 절대 금지 — 실 dev BE 응답으로만 단언.
 */

test.describe('P8-01 포인트 적립', () => {
  /**
   * 픽업완료 주문 1건 시드 후 Hero(잔액 또는 적립 예정)와 적립 내역에 해당 금액이 표시된다.
   *
   * 현황: test.fail — BE /dev/test/orders 가 포인트 적립 트리거 안 함 (dev 실측 확인)
   * BE 수정(OrderCompleted 이벤트 발행) 후 test.fail() 줄을 제거하면 green.
   */
  test('픽업완료 주문 1건 후 포인트 Hero와 적립 내역에 해당 금액이 표시된다', async ({
    customer,
    customerPage,
  }) => {
    // ── BE 갭: /dev/test/orders 가 포인트 적립 도메인 이벤트를 발행하지 않아 항상 0P ──
    // dev 실측(2026-06-15): balance=0, pendingPoints=0, history 빈 상태
    // BE 수정 후 아래 test.fail() 줄 제거
    test.fail(true, 'BE 갭: /dev/test/orders COMPLETED 주문이 포인트 적립(EARN 트랜잭션)을 트리거하지 않음')

    test.setTimeout(120_000) // createSeller=국세청 연동 포함

    // ── 시드: 사장·매장·상품·떨이·완료주문 ──────────────────────────────────────
    const seller = await createSeller()
    const pid = await seedProduct(seller.token, seller.store.id, {
      name: `E2E포인트상품${Date.now()}`,
      // regularPrice 기본값 5000 → salePrice=2000 으로 할인율 만족
    })
    const ci = await seedClearance(seller.token, seller.store.id, pid, {
      salePrice: 2000, // 2000 < regularPrice(5000) → CLEARANCE_ITEM_SALE_PRICE_NOT_DISCOUNTED 통과
      totalQuantity: 5,
    })
    const customerId = await customerIdOf(customer)
    const order = await seedOrder({
      targetState: 'COMPLETED',
      customerId,
      storeId: seller.store.id,
      clearanceItemId: ci,
    })

    // 적립 포인트 = floor(finalAmount × 1%)
    const expectedPoints = Math.floor(order.finalAmount * 0.01)
    const expectedStr = expectedPoints.toLocaleString('ko-KR')

    // ── 포인트 화면 진입 (시드 후 캐시 무효화를 위해 fresh reload) ──────────────
    await spaGotoFresh(customerPage, '/mypage/points')
    await expect(customerPage.getByRole('heading', { name: '포인트' })).toBeVisible()

    // ── Hero: balance 또는 pendingPoints 에 expectedPoints 표시 확인 ──────────────
    //   - balance 형태: "/^{n}\s+P$/" (pendingPoints 가 없을 때 잔액이 Hero 전체)
    //   - pendingPoints 형태: "/^\+{n} P$/" (D1 환불 윈도우 중 — 3일 후 balance 로 확정)
    const heroBalance = customerPage.getByText(new RegExp(`^${expectedStr}\\s+P$`))
    const heroPending = customerPage.getByText(new RegExp(`^\\+${expectedStr} P$`))

    const balanceVisible = await heroBalance.isVisible()
    const pendingVisible = await heroPending.isVisible()

    expect(
      balanceVisible || pendingVisible,
      `Hero 에 ${expectedPoints}P 가 잔액("${expectedStr} P") 또는 적립예정("+${expectedStr} P") 으로 표시되어야 함. ` +
        `salePrice=2000, finalAmount=${order.finalAmount}, expectedPoints=${expectedPoints}`,
    ).toBe(true)

    // ── 적립 내역 탭 → EARN 건 확인 ─────────────────────────────────────────────
    await customerPage.getByRole('tab', { name: '적립' }).click()

    // "결제 적립" 라벨이 내역 행에 있어야 함 (POINT_REASON_LABEL['EARN'] = '결제 적립')
    await expect(customerPage.getByText('결제 적립').first()).toBeVisible()

    // 적립 금액: "+{n}P" (공백 없음 — PointHistoryRow: `+${amount.toLocaleString('ko-KR')}P`)
    await expect(customerPage.getByText(`+${expectedStr}P`, { exact: true })).toBeVisible()
  })

  /**
   * 픽업완료 주문 2건 시드 후 포인트가 합산되어 Hero에 표시되고 적립 내역 탭에 2건이 있어야 한다.
   *
   * 현황: test.fail — 동일 BE 갭
   * BE 수정 후 test.fail() 줄 제거.
   */
  test('픽업완료 주문 2건 후 포인트가 합산되어 Hero와 적립 내역 2건에 표시된다', async ({
    customer,
    customerPage,
  }) => {
    test.fail(true, 'BE 갭: /dev/test/orders COMPLETED 주문이 포인트 적립(EARN 트랜잭션)을 트리거하지 않음')

    test.setTimeout(120_000) // createSeller 1회 + 상품 2개 시드

    // ── 시드: 사장 1명, 상품 2개, 떨이 2개, 완료 주문 2건 ──────────────────────
    const seller = await createSeller()
    const customerId = await customerIdOf(customer)

    // 주문 1: regularPrice=5000(기본), salePrice=2000 → pts1 = floor(2000×0.01) = 20
    const pid1 = await seedProduct(seller.token, seller.store.id, {
      name: `E2E포인트상품A${Date.now()}`,
    })
    const ci1 = await seedClearance(seller.token, seller.store.id, pid1, {
      salePrice: 2000, // 2000 < 5000 → 할인율 통과
      totalQuantity: 5,
    })
    const order1 = await seedOrder({
      targetState: 'COMPLETED',
      customerId,
      storeId: seller.store.id,
      clearanceItemId: ci1,
    })

    // 주문 2: regularPrice=5000(기본), salePrice=3000 → pts2 = floor(3000×0.01) = 30
    // ⚠️ salePrice < regularPrice(5000) 조건 필수 — 5000은 같아서 400 CLEARANCE_ITEM_SALE_PRICE_NOT_DISCOUNTED
    const pid2 = await seedProduct(seller.token, seller.store.id, {
      name: `E2E포인트상품B${Date.now()}`,
    })
    const ci2 = await seedClearance(seller.token, seller.store.id, pid2, {
      salePrice: 3000, // 3000 < 5000 → 할인율 통과
      totalQuantity: 5,
    })
    const order2 = await seedOrder({
      targetState: 'COMPLETED',
      customerId,
      storeId: seller.store.id,
      clearanceItemId: ci2,
    })

    const pts1 = Math.floor(order1.finalAmount * 0.01)
    const pts2 = Math.floor(order2.finalAmount * 0.01)
    const totalPoints = pts1 + pts2
    const totalStr = totalPoints.toLocaleString('ko-KR')

    // ── 포인트 화면 진입 ───────────────────────────────────────────────────────
    await spaGotoFresh(customerPage, '/mypage/points')
    await expect(customerPage.getByRole('heading', { name: '포인트' })).toBeVisible()

    // ── Hero: 합산 금액이 balance 또는 pendingPoints 에 표시 ──────────────────────
    const heroBalance = customerPage.getByText(new RegExp(`^${totalStr}\\s+P$`))
    const heroPending = customerPage.getByText(new RegExp(`^\\+${totalStr} P$`))

    const balanceVisible = await heroBalance.isVisible()
    const pendingVisible = await heroPending.isVisible()

    expect(
      balanceVisible || pendingVisible,
      `Hero 에 합산 ${totalPoints}P(${pts1}+${pts2}) 가 잔액 또는 적립예정으로 표시되어야 함`,
    ).toBe(true)

    // ── 적립 내역 탭: 2건 EARN 확인 (신규 계정 = 이 테스트 주문만) ──────────────
    await customerPage.getByRole('tab', { name: '적립' }).click()
    await expect(customerPage.getByText('결제 적립').first()).toBeVisible()
    await expect(customerPage.getByText('결제 적립')).toHaveCount(2)

    // 각 주문의 적립 금액 행
    await expect(customerPage.getByText(`+${pts1.toLocaleString('ko-KR')}P`, { exact: true })).toBeVisible()
    await expect(customerPage.getByText(`+${pts2.toLocaleString('ko-KR')}P`, { exact: true })).toBeVisible()
  })
})
