import { test, expect } from '@playwright/test'
import { spaGoto, spaGotoFresh } from '../fixtures/navigation'
import { openFreshCustomerPage, openFreshSellerPage } from '../fixtures/journeys'
import { seedProduct, seedClearance } from '../fixtures/seller'
import { seedOrder } from '../fixtures/order'
import { customerIdOf } from '../fixtures/api'

/**
 * Journey: order-lifecycle (cross-app 멀티컨텍스트)
 * 사장 등록(떨이) → 소비자 주문(시드 PENDING) → 사장 전이(수락→준비완료→수령완료) ↔ 소비자 상태 동기화
 * → 소비자 리뷰 진입. + P7-06 거래 알림(사장 수락 → 소비자 알림센터).
 *
 * 주문 생성 자체는 토스라 시드(seedOrder PENDING)로 대체 — 그 뒤 **양 앱의 실 UI**로 전이·동기화·알림·리뷰.
 */
test.describe('order-lifecycle — 사장 전이 ↔ 소비자 동기화', () => {
  test('PENDING 주문을 사장이 수락→준비완료→수령완료, 소비자 화면·알림이 따라온다', async ({
    browser,
  }) => {
    test.setTimeout(180_000) // createSeller ×2(국세청) + 전이 체인

    // ── setup: 사장 매장+떨이, 소비자, PENDING 주문
    const sellerSession = await openFreshSellerPage(browser)
    const custSession = await openFreshCustomerPage(browser)
    try {
      const { seller, page: sPage } = sellerSession
      const { account, page: cPage } = custSession
      const customerId = await customerIdOf(account)
      const pid = await seedProduct(seller.token, seller.store.id, { name: `떨이${Date.now()}` })
      const ci = await seedClearance(seller.token, seller.store.id, pid, { totalQuantity: 5 })
      const order = await seedOrder({
        targetState: 'PENDING',
        customerId,
        storeId: seller.store.id,
        clearanceItemId: ci,
      })

      // ── 소비자: 주문이 보인다 (결제완료/주문접수 단계)
      await spaGotoFresh(cPage, `/orders/${order.orderId}`)
      await expect(cPage.getByText(seller.store.name).first()).toBeVisible({ timeout: 15_000 })

      // ── 사장: 주문 상세 → 수락
      await spaGoto(sPage, `/orders/${order.orderId}`)
      await sPage.getByRole('button', { name: '수락' }).first().click()
      await expect(sPage.getByText('준비중')).toBeVisible({ timeout: 15_000 })

      // ── P7-06: 소비자 알림센터에 거래 알림 반영 (사장 수락 트리거)
      await spaGotoFresh(cPage, '/notifications')
      await expect(cPage.getByText(seller.store.name).first()).toBeVisible({ timeout: 15_000 })

      // ── 사장: 준비완료 → 수령완료
      // (소비자 중간 상태 라벨은 3단계 뷰라 매핑 상이 → 최종 픽업완료 동기화로 검증)
      await sPage.getByRole('button', { name: '준비 완료' }).first().click()
      await expect(sPage.getByText('준비완료')).toBeVisible({ timeout: 15_000 })
      await sPage.getByRole('button', { name: '수령 완료 처리' }).first().click()
      await expect(sPage.getByText('처리할 작업이 없어요')).toBeVisible({ timeout: 15_000 }) // COMPLETED 터미널

      // ── 소비자: 픽업 완료 동기화 + 리뷰 진입 가능 (3단계 뷰 "픽업 완료" + 리뷰 작성 버튼)
      await spaGotoFresh(cPage, `/orders/${order.orderId}`)
      await expect(cPage.getByText('픽업 완료').first()).toBeVisible({ timeout: 15_000 })
      await expect(cPage.getByRole('button', { name: '리뷰 작성' })).toBeVisible({ timeout: 10_000 })
    } finally {
      await sellerSession.close()
      await custSession.close()
    }
  })
})
