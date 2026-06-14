import { test, expect } from '../../fixtures/test'
import { spaGoto } from '../../fixtures/navigation'

/**
 * P4-02 전체 매장 조회 (/all)
 *
 * 정렬 5종: 추천/거리/할인율/마감임박/별점. 기본주소 5km 이내 전체 매장.
 * StoreSortTabs 의 aria-pressed 로 활성 정렬 확인.
 */

test.describe('P4-02 전체 매장 조회', () => {
  test('전체 매장 제목이 표시된다', async ({ customerPage }) => {
    await spaGoto(customerPage, '/all')
    await expect(customerPage.getByRole('heading', { name: '전체 매장' })).toBeVisible()
  })

  test('정렬 칩 5종(추천순·거리순·할인율순·마감임박순·별점순)이 모두 표시된다', async ({ customerPage }) => {
    await spaGoto(customerPage, '/all')
    for (const label of ['추천순', '거리순', '할인율순', '마감임박순', '별점순']) {
      await expect(customerPage.getByRole('button', { name: label })).toBeVisible()
    }
  })

  test('기본 정렬은 추천순 (aria-pressed=true)', async ({ customerPage }) => {
    await spaGoto(customerPage, '/all')
    await expect(customerPage.getByRole('button', { name: '추천순' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  test('거리순 클릭 → 거리순 활성, 추천순 비활성', async ({ customerPage }) => {
    await spaGoto(customerPage, '/all')
    await customerPage.getByRole('button', { name: '거리순' }).click()
    await expect(customerPage.getByRole('button', { name: '거리순' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await expect(customerPage.getByRole('button', { name: '추천순' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  test('5km 이내 기존 시드 매장(서경분식)이 목록에 표시된다', async ({ customerPage }) => {
    await spaGoto(customerPage, '/all')
    // 기존 시드: id 27 서경분식 등 서경로 클러스터 OPEN 매장 → StoreListCard 로 노출
    await expect(customerPage.getByText('서경분식')).toBeVisible()
  })

  test('"전체 N곳" 요약 텍스트가 표시된다', async ({ customerPage }) => {
    await spaGoto(customerPage, '/all')
    // StoreListBody: "전체 N곳 · 마감 할인 진행 M곳"
    await expect(customerPage.getByText(/전체.*곳/)).toBeVisible()
  })
})
