import { test, expect } from '@playwright/test'
import { spaGotoFresh } from '../fixtures/navigation'
import { openFreshCustomerPage } from '../fixtures/journeys'
import { createSeller, seedProduct, seedClearance } from '../fixtures/seller'
import { seedFavorite } from '../fixtures/seed'

/**
 * Journey: noti-sync (cross-app, 결제 무관)
 * 소비자가 단골 등록한 매장이 떨이를 등록하면 → 소비자 알림센터에 반영(P7-04 떨이 등록 알림).
 * 순서가 핵심: **단골 등록(떨이 전) → 떨이 등록** 이어야 알림 대상이 된다.
 */
test.describe('noti-sync — 단골 매장 떨이 등록 → 소비자 알림', () => {
  test('단골 매장이 떨이를 올리면 소비자 알림센터에 매장이 뜬다', async ({ browser }) => {
    test.setTimeout(120_000) // createSeller=국세청

    const seller = await createSeller()
    const productId = await seedProduct(seller.token, seller.store.id, { name: `떨이${Date.now()}` })

    const { account, page, close } = await openFreshCustomerPage(browser)
    try {
      await seedFavorite(account, seller.store.id) // 떨이 등록 전에 단골
      await seedClearance(seller.token, seller.store.id, productId, { salePrice: 2000 }) // 알림 트리거

      // 알림센터에 그 매장 떨이 알림 반영 (하드 리로드로 최신 fetch)
      await spaGotoFresh(page, '/notifications')
      await expect(page.getByText(seller.store.name)).toBeVisible({ timeout: 15_000 })
    } finally {
      await close()
    }
  })
})
