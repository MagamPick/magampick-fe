import { test, expect } from '../../fixtures/seller-test'
import { spaGoto } from '../../fixtures/navigation'

/**
 * P5-14 사장 주문 목록 (빈 상태) E2E
 *
 * 커버:
 *   - /orders 진입 → 헤더(h1 "주문 관리") 렌더
 *   - 탭리스트 5세그먼트(신규/준비중/준비완료/완료/취소·환불) + 기본 aria-selected
 *   - 신규 사장(주문 0) → 신규 탭 빈 상태 메시지
 *   - 탭 전환(준비중→준비완료→완료→취소·환불→신규) aria-selected 갱신 + 각 탭 빈 상태 메시지
 *   - 검색 버튼(주문 검색) 오픈 → 인풋 등장, 닫기 버튼 → 원위치
 *
 * 범위 제외 — order/journey 단계로 이연 (전부 결제된 주문 선행 필요):
 *   - P5-08 주문 수락 (PENDING → PREPARING)
 *   - P5-09 주문 거절 (PENDING → REJECTED), ConfirmSheet
 *   - P5-10 준비 완료 변경 (PREPARING → READY)
 *   - P5-11 픽업코드 표시 (READY 상태 강조)
 *   - P5-12 수령 완료 처리 (READY → COMPLETED)
 *   - P5-13 미수령 처리 (READY → NO_SHOW), ConfirmSheet
 *
 * ★ spaGotoFresh 금지 — 사장 앱 하드 리로드 = 로그아웃.
 */

test.describe('P5-14 주문 목록 (빈 상태)', () => {
  /**
   * 탭리스트는 API 응답 전에도 즉시 렌더 → 데이터 대기 없이 구조 확인.
   * 기본 선택: 신규(aria-selected=true), 나머지 false.
   */
  test('헤더 · 탭리스트 5세그먼트 초기 렌더 및 기본 선택값', async ({ sellerPage }) => {
    await spaGoto(sellerPage, '/orders')

    // h1 "주문 관리"
    await expect(sellerPage.getByRole('heading', { name: '주문 관리' })).toBeVisible()

    // 탭리스트 (role=tablist, aria-label="주문 상태")
    const tabList = sellerPage.getByRole('tablist', { name: '주문 상태' })
    await expect(tabList.getByRole('tab', { name: '신규' })).toBeVisible()
    await expect(tabList.getByRole('tab', { name: '준비중' })).toBeVisible()
    await expect(tabList.getByRole('tab', { name: '준비완료' })).toBeVisible()
    // ★ '완료'는 '준비완료'의 부분 문자열 → exact: true
    await expect(tabList.getByRole('tab', { name: '완료', exact: true })).toBeVisible()
    await expect(tabList.getByRole('tab', { name: '취소·환불' })).toBeVisible()

    // 기본 선택: 신규(true), 나머지 false
    await expect(tabList.getByRole('tab', { name: '신규' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    await expect(tabList.getByRole('tab', { name: '준비중' })).toHaveAttribute(
      'aria-selected',
      'false',
    )
    await expect(tabList.getByRole('tab', { name: '준비완료' })).toHaveAttribute(
      'aria-selected',
      'false',
    )
    await expect(tabList.getByRole('tab', { name: '완료', exact: true })).toHaveAttribute(
      'aria-selected',
      'false',
    )
    await expect(tabList.getByRole('tab', { name: '취소·환불' })).toHaveAttribute(
      'aria-selected',
      'false',
    )
  })

  /**
   * 신규 탭 빈 상태 — API 응답 후 "새로 들어온 주문이 없어요." 표시.
   * storeId 주입(useCurrentStoreStore) + 주문 목록 fetch 완료 후 렌더 → 넉넉한 timeout.
   */
  test('신규 탭 빈 상태 메시지', async ({ sellerPage }) => {
    await spaGoto(sellerPage, '/orders')
    await expect(sellerPage.getByText('새로 들어온 주문이 없어요.')).toBeVisible({
      timeout: 20_000,
    })
  })

  /**
   * 탭 전환 — 클라이언트 필터(세그먼트별 분기)라 탭 전환 시 API 재요청 없음 → 즉시 전환.
   * 각 탭의 aria-selected 상태와 빈 상태 메시지를 순서대로 확인.
   */
  test('탭 전환 — aria-selected 갱신 + 각 탭 빈 상태 메시지', async ({ sellerPage }) => {
    await spaGoto(sellerPage, '/orders')
    // 초기 로드 대기 (신규 탭 빈 상태)
    await expect(sellerPage.getByText('새로 들어온 주문이 없어요.')).toBeVisible({
      timeout: 20_000,
    })

    const tabList = sellerPage.getByRole('tablist', { name: '주문 상태' })

    // ── 준비중 ──
    await tabList.getByRole('tab', { name: '준비중' }).click()
    await expect(tabList.getByRole('tab', { name: '준비중' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    await expect(tabList.getByRole('tab', { name: '신규' })).toHaveAttribute(
      'aria-selected',
      'false',
    )
    await expect(sellerPage.getByText('준비 중인 주문이 없어요.')).toBeVisible()

    // ── 준비완료 ──
    await tabList.getByRole('tab', { name: '준비완료' }).click()
    await expect(tabList.getByRole('tab', { name: '준비완료' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    await expect(sellerPage.getByText('준비 완료된 주문이 없어요.')).toBeVisible()

    // ── 완료 (exact: '준비완료' 와 구분) ──
    await tabList.getByRole('tab', { name: '완료', exact: true }).click()
    await expect(tabList.getByRole('tab', { name: '완료', exact: true })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    await expect(sellerPage.getByText('완료된 주문이 없어요.')).toBeVisible()

    // ── 취소·환불 ──
    await tabList.getByRole('tab', { name: '취소·환불' }).click()
    await expect(tabList.getByRole('tab', { name: '취소·환불' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    await expect(sellerPage.getByText('취소·환불 내역이 없어요.')).toBeVisible()

    // ── 신규 (원위치) ──
    await tabList.getByRole('tab', { name: '신규' }).click()
    await expect(tabList.getByRole('tab', { name: '신규' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    await expect(sellerPage.getByText('새로 들어온 주문이 없어요.')).toBeVisible()
  })

  /**
   * 검색 버튼(aria-label="주문 검색") 클릭 → 검색 인풋 등장 + h1 교체.
   * 닫기 버튼(aria-label="검색 닫기") 클릭 → 인풋 숨김 + h1 복원.
   */
  test('검색 인풋 오픈 · 닫기', async ({ sellerPage }) => {
    await spaGoto(sellerPage, '/orders')
    await expect(sellerPage.getByRole('heading', { name: '주문 관리' })).toBeVisible()

    // 검색 버튼 클릭 → 검색 모드
    await sellerPage.getByRole('button', { name: '주문 검색' }).click()
    await expect(sellerPage.getByPlaceholder('주문번호 또는 고객명 검색')).toBeVisible()
    // 헤더가 검색 인풋으로 교체 — h1 숨김
    await expect(sellerPage.getByRole('heading', { name: '주문 관리' })).toBeHidden()

    // 닫기 버튼 클릭 → 원위치
    await sellerPage.getByRole('button', { name: '검색 닫기' }).click()
    await expect(sellerPage.getByRole('heading', { name: '주문 관리' })).toBeVisible()
    await expect(sellerPage.getByPlaceholder('주문번호 또는 고객명 검색')).toBeHidden()
  })
})

/**
 * P5-optional 주문 상세 방어 — 없는 주문 ID 직접 접근 시 에러 상태 표시.
 * orderParamsSchema(z.string().min(1)) 통과 → useOrder fired → BE 404 → isError →
 * ErrorState "주문을 찾을 수 없어요." (OrderDetailPage.tsx line 81-83).
 */
test.describe('P5-optional 주문 상세 방어', () => {
  test('없는 주문 ID 접근 → 에러 상태 표시', async ({ sellerPage }) => {
    // 비어있지 않은 문자열 → 파라미터 파싱 통과 → API 404 → ErrorState
    await spaGoto(sellerPage, '/orders/nonexistent-order-000000')
    await expect(sellerPage.getByText('주문을 찾을 수 없어요.')).toBeVisible({ timeout: 20_000 })
  })
})
