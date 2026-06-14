import { test, expect } from '@playwright/test'
import { spaGoto } from '../fixtures/navigation'
import { openFreshCustomerPage } from '../fixtures/journeys'
import { seedNearbyDeal } from '../fixtures/seller'

/**
 * Journey: deal-exposure (cross-app, 결제 무관)
 * 사장이 방금 등록한 떨이가 소비자 앱에 노출되는 producer→consumer 흐름.
 * 사장측=API 시드(seedNearbyDeal: 새 사장+매장+상품+활성 떨이, 서경대 권역) / 소비자측=실 UI.
 * (검색 경로 노출은 search-home 스윗 P9-01/02 가 별도 커버 — 여기선 매장 상세 노출을 본다.)
 */
test.describe('deal-exposure — 사장 떨이 → 소비자 노출', () => {
  test('소비자 매장 상세에 방금 등록된 떨이(상품·할인가)가 보인다', async ({ browser }) => {
    test.setTimeout(120_000) // createSeller=국세청

    const deal = await seedNearbyDeal({ productName: `떨이${Date.now()}`, salePrice: 2000 })
    const { page, close } = await openFreshCustomerPage(browser) // 서경대 주소 소비자
    try {
      await spaGoto(page, `/store/${deal.storeId}`)
      await expect(page.getByText(deal.storeName)).toBeVisible()
      await expect(page.getByText(deal.productName)).toBeVisible()
      // 떨이(할인가) 로 노출됐는지 — 할인가 2,000원 표시
      await expect(page.getByText('2,000').first()).toBeVisible()
    } finally {
      await close()
    }
  })
})
