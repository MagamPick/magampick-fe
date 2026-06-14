import { test, expect } from '../../fixtures/test'
import { spaGoto } from '../../fixtures/navigation'

/**
 * P9-01 키워드 검색 + P9-02 자동완성 (/search)
 *
 * SearchPage 3-state:
 *   home     = 빈 입력 → RecentSearches (최근 검색어)
 *   autocomplete = 입력 중 (trimmed !== q) → AutocompleteDropdown
 *   results  = 제출 후 (trimmed === q) → SearchResults (매장·상품 섹션)
 *
 * 기존 시드 매장 사용:
 *   "서경" 검색 → 서경분식 · 서경베이커리 · 서경로스터리 등 매장 섹션
 *   "떡볶이" 검색 → 서경분식의 메뉴(상품) 섹션
 *
 * SearchHeader: aria-label="검색어 입력" input, Enter 로 제출.
 * 자동완성 debounce 200ms → expect(toBeVisible) 이 auto-wait 으로 흡수.
 */

test.describe('P9-01 키워드 검색 — 매장명', () => {
  test('"서경" 검색 제출 → 매장 섹션에 서경분식이 표시된다', async ({ customerPage }) => {
    await spaGoto(customerPage, '/search')
    await customerPage.getByLabel('검색어 입력').fill('서경')
    await customerPage.getByLabel('검색어 입력').press('Enter')

    // SearchResults: 매장 섹션 — StoreListCard 에 매장명 표시
    await expect(customerPage.getByText('서경분식')).toBeVisible()
  })

  test('"서경" 검색 → 매장 섹션 카운트("매장 N") 표시', async ({ customerPage }) => {
    await spaGoto(customerPage, '/search')
    await customerPage.getByLabel('검색어 입력').fill('서경')
    await customerPage.getByLabel('검색어 입력').press('Enter')

    // SearchResults: <p>매장 <b>N</b></p> — 텍스트 합산으로 "매장 N" 을 포함
    // NOTE: "매장" 이라는 단어는 페이지 내 고유하지 않을 수 있어 first() 사용
    await expect(customerPage.getByText(/매장/).filter({ hasText: /\d/ }).first()).toBeVisible()
  })
})

test.describe('P9-01 키워드 검색 — 상품명', () => {
  test('"떡볶이" 검색 제출 → 상품 섹션에 떡볶이가 표시된다', async ({ customerPage }) => {
    await spaGoto(customerPage, '/search')
    await customerPage.getByLabel('검색어 입력').fill('떡볶이')
    await customerPage.getByLabel('검색어 입력').press('Enter')

    // 서경분식 등 기존 시드 매장에 떡볶이 메뉴 존재
    // SearchResults ProductResultRow 에 상품명 표시
    await expect(customerPage.getByText('떡볶이')).toBeVisible()
  })
})

test.describe('P9-02 자동완성', () => {
  test('"서경" 입력 중 자동완성 후보 목록이 표시된다', async ({ customerPage }) => {
    await spaGoto(customerPage, '/search')
    await customerPage.getByLabel('검색어 입력').fill('서경')

    // AutocompleteDropdown: <ul> 안 <li><button> (매장 Store 아이콘 / 상품 Tag 아이콘 포함)
    // debounce 200ms + BE 응답 대기 → expect auto-wait(10s) 으로 흡수
    const firstSuggestion = customerPage.locator('ul li button').first()
    await expect(firstSuggestion).toBeVisible()
    // 제안 텍스트가 "서경" 을 포함해야 함 (FTS 결과 기대)
    await expect(firstSuggestion).toContainText('서경')
  })

  test('자동완성 첫 번째 제안 탭 → SearchResults(정렬칩) 가 표시된다', async ({ customerPage }) => {
    await spaGoto(customerPage, '/search')
    await customerPage.getByLabel('검색어 입력').fill('서경')

    // 자동완성 후보 대기
    const firstSuggestion = customerPage.locator('ul li button').first()
    await expect(firstSuggestion).toBeVisible()

    // 제안 텍스트는 <span> 자식에서 추출 (SVG aria-label 텍스트 제외)
    const suggestionText = (await firstSuggestion.locator('span').textContent()) ?? ''

    await firstSuggestion.click()

    // 클릭 후: mode = 'results' (URL ?q=<제안텍스트>) → SearchResults 렌더
    // SearchResults 는 StoreSortTabs 를 항상 포함 — "추천순" 버튼 노출로 results 모드 확인
    await expect(customerPage.getByRole('button', { name: '추천순' })).toBeVisible()

    // 입력칸 값도 제안 텍스트와 일치해야 함
    if (suggestionText.trim()) {
      await expect(customerPage.getByLabel('검색어 입력')).toHaveValue(suggestionText.trim())
    }
  })
})
