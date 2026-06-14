import { test, expect } from '../../fixtures/test'
import { spaGotoFresh } from '../../fixtures/navigation'
import { seedFavorite } from '../../fixtures/seed'
import { seedNearbyDeal, kstFromNow } from '../../fixtures/seller'

/**
 * P4-01 홈 피드 (마감임박/단골/동네 섹션, 5km, 기본주소 기준)
 *
 * 소비자 기본 주소 = 서경로 2 (성북 서경대 클러스터).
 * customerPage fixture 는 이미 / 에 로드된 상태.
 */

test.describe('P4-01 홈 피드 — 섹션 헤더', () => {
  test('3개 섹션 헤더(마감임박·단골·동네)가 모두 표시된다', async ({ customerPage }) => {
    // customerPage fixture 는 / 에 이미 로드됨 — 추가 이동 불필요
    await expect(customerPage.getByRole('heading', { name: /마감 임박 특가/ })).toBeVisible()
    await expect(customerPage.getByRole('heading', { name: /내 단골 가게/ })).toBeVisible()
    await expect(customerPage.getByRole('heading', { name: /우리 동네 마감픽/ })).toBeVisible()
  })
})

test.describe('P4-01 홈 피드 — 동네 섹션', () => {
  test('동네 섹션에 근처 매장이 표시된다', async ({ customerPage }) => {
    // 5km·OPEN·단골제외 매장이 StoreRow(이름·거리·★평점)로 노출된다.
    // ★특정 시드 매장명(서경분식) 대신 "섹션 비어있지 않음"으로 단언 — 누적 E2E 매장이 동네 top6
    //  추천정렬을 흔들어도 견고(풀 통합 실행에서 발견).
    const neighborhood = customerPage.locator('section').filter({ hasText: '우리 동네 마감픽' })
    await expect(neighborhood.getByText('★', { exact: false }).first()).toBeVisible({
      timeout: 10_000,
    })
  })
})

test.describe('P4-01 홈 피드 — 단골 섹션', () => {
  test('단골 추가 후 홈에 해당 매장이 단골 섹션에 표시된다', async ({ customer, customerPage }) => {
    // seedFavorite 은 API 로 단골 추가 (storeId=27 서경분식, 서경로2 = 고객 주소 근처)
    await seedFavorite(customer, 27)
    // 캐시(staleTime 1분) 회피용 하드 리로드
    await spaGotoFresh(customerPage, '/')

    const favSection = customerPage.locator('section').filter({ hasText: '내 단골 가게' })
    await expect(favSection.getByText('서경분식')).toBeVisible()
  })
})

test.describe('P4-01 홈 피드 — 마감임박 섹션', () => {
  test('30분 내 마감 떨이 생성 후 홈 마감임박 섹션에 카드가 표시된다', async ({ customerPage }) => {
    // ⚠️ 국세청 호출 포함 — seedNearbyDeal 은 새 사장 계정 + 매장 + 상품 + 떨이를 생성
    test.setTimeout(120_000) // 국세청 실연동 여유 시간

    const deal = await seedNearbyDeal({ pickupEndAt: kstFromNow(0.5) }) // 30분 후 마감
    // BE 의 closing-deals 필터 조건: 픽업 60분 이내 → 30분짜리 떨이가 포함되어야 함
    await spaGotoFresh(customerPage, '/')

    const closingSection = customerPage.locator('section').filter({ hasText: '마감 임박 특가' })
    await expect(closingSection.getByText(deal.storeName)).toBeVisible()
  })
})
