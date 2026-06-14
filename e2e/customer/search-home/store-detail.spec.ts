import { test, expect } from '../../fixtures/test'
import { spaGoto } from '../../fixtures/navigation'

/**
 * P4-03 매장 상세 (/store/{id})
 *
 * 기존 시드 매장 27(서경분식) 사용 — OPEN + 리뷰 1개 이상 존재 (seed_phaseA 기준).
 * 탭: 마감 할인(default) · 메뉴 · 리뷰 · 정보. 리뷰 탭 = 평가 요약 + 리뷰 카드.
 * 거리: formatDistance(km) = "X.Xkm" 형식.
 */

const STORE_ID = 27 // 서경분식

test.describe('P4-03 매장 상세', () => {
  test('매장명(서경분식)이 h1 으로 표시된다', async ({ customerPage }) => {
    await spaGoto(customerPage, `/store/${STORE_ID}`)
    await expect(customerPage.getByRole('heading', { name: '서경분식' })).toBeVisible()
  })

  test('거리 정보(Xkm 형식)가 표시된다', async ({ customerPage }) => {
    await spaGoto(customerPage, `/store/${STORE_ID}`)
    // StoreHeadMeta: formatDistance → "0km" or "X.Xkm"
    await expect(customerPage.getByText(/\d+\.?\d*km/)).toBeVisible()
  })

  test('4개 탭(마감 할인·메뉴·리뷰·정보)이 표시된다', async ({ customerPage }) => {
    await spaGoto(customerPage, `/store/${STORE_ID}`)
    // StoreTabs: role="tablist" 안에 role="tab" 버튼들
    for (const tabName of ['마감 할인', '메뉴', '리뷰', '정보']) {
      await expect(customerPage.getByRole('tab', { name: tabName })).toBeVisible()
    }
  })

  test('리뷰 탭 클릭 → 리뷰 개수 요약이 표시된다', async ({ customerPage }) => {
    await spaGoto(customerPage, `/store/${STORE_ID}`)
    await customerPage.getByRole('tab', { name: '리뷰' }).click()
    // RatingSummary: "리뷰 N개" 텍스트 (store 27 은 리뷰 1개 이상 존재)
    await expect(customerPage.getByText(/리뷰 \d+개/)).toBeVisible()
  })

  test('리뷰 탭 — 리뷰 카드가 1개 이상 렌더된다', async ({ customerPage }) => {
    await spaGoto(customerPage, `/store/${STORE_ID}`)
    await customerPage.getByRole('tab', { name: '리뷰' }).click()
    // ReviewCard: border rounded-[12px] 안에 별점(★☆) + 작성자 + 본문
    // 별점 패턴 "★☆" 또는 전체 별점 "★★★★★" 이 보이면 카드 렌더 확인
    await expect(customerPage.getByText(/★/).first()).toBeVisible()
  })

  test('액션 버튼(전화·지도·공유)이 표시된다', async ({ customerPage }) => {
    await spaGoto(customerPage, `/store/${STORE_ID}`)
    // StoreActions: 전화(tel a) · 지도(button) · 공유(button) — 3분할 행
    await expect(customerPage.getByText('전화')).toBeVisible()
    await expect(customerPage.getByText('지도')).toBeVisible()
    await expect(customerPage.getByText('공유')).toBeVisible()
  })
})
