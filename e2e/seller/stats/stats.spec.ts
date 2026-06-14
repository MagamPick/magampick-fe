import { test, expect } from '../../fixtures/seller-test'
import { spaGoto } from '../../fixtures/navigation'

/**
 * P10-01 사장 통계 대시보드 (읽기 전용) E2E
 *
 * 커버:
 *   - /analytics 진입 → 헤더(h1) · 기간 토글 4종 · 패널 탭 4종 렌더
 *   - 기간 토글(오늘/이번 주/이번 달/올해) 전환 시 매출 히어로 라벨·aria-pressed 갱신
 *   - 4개 패널(매출/주문/떨이/리뷰) 전환·aria-selected 및 신규 사장 0/빈 값 표시
 *
 * 범위 제외 (보고):
 *   - 숫자 정확성 검증 — 완료 주문 선행 필요 → order/journey 단계로 이연
 *
 * 전제: dev 신규 사장 (매출·주문·리뷰 0, 판매 이력 없음).
 * ★ spaGotoFresh 금지 (사장 앱 하드 리로드 = 로그아웃).
 */
test.describe('사장 통계 대시보드 (P10-01)', () => {
  /**
   * 기간 토글·패널 탭은 API 응답 전에도 렌더됨 — 데이터 대기 없이 바로 확인.
   * 기본 선택값: 기간=오늘(aria-pressed=true), 패널=매출(aria-selected=true).
   */
  test('헤더 · 기간 토글 · 패널 탭 초기 렌더 및 기본 선택값', async ({ sellerPage }) => {
    await spaGoto(sellerPage, '/analytics')

    // h1 "통계"
    await expect(sellerPage.getByRole('heading', { name: '통계' })).toBeVisible()

    // 기간 토글 그룹 (role=group aria-label="기간 선택") — 4개 버튼
    const periodGroup = sellerPage.getByRole('group', { name: '기간 선택' })
    await expect(periodGroup.getByRole('button', { name: '오늘' })).toBeVisible()
    await expect(periodGroup.getByRole('button', { name: '이번 주' })).toBeVisible()
    await expect(periodGroup.getByRole('button', { name: '이번 달' })).toBeVisible()
    await expect(periodGroup.getByRole('button', { name: '올해' })).toBeVisible()

    // 기본 선택: 오늘 (aria-pressed=true), 나머지 false
    await expect(periodGroup.getByRole('button', { name: '오늘' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await expect(periodGroup.getByRole('button', { name: '이번 주' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
    await expect(periodGroup.getByRole('button', { name: '이번 달' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
    await expect(periodGroup.getByRole('button', { name: '올해' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )

    // 패널 탭 (role=tablist aria-label="통계 항목") — 4개 탭
    const tabList = sellerPage.getByRole('tablist', { name: '통계 항목' })
    await expect(tabList.getByRole('tab', { name: '매출' })).toBeVisible()
    await expect(tabList.getByRole('tab', { name: '주문' })).toBeVisible()
    await expect(tabList.getByRole('tab', { name: '떨이' })).toBeVisible()
    await expect(tabList.getByRole('tab', { name: '리뷰' })).toBeVisible()

    // 기본 선택: 매출 탭 (aria-selected=true), 나머지 false
    await expect(tabList.getByRole('tab', { name: '매출' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    await expect(tabList.getByRole('tab', { name: '주문' })).toHaveAttribute(
      'aria-selected',
      'false',
    )
    await expect(tabList.getByRole('tab', { name: '떨이' })).toHaveAttribute(
      'aria-selected',
      'false',
    )
    await expect(tabList.getByRole('tab', { name: '리뷰' })).toHaveAttribute(
      'aria-selected',
      'false',
    )
  })

  /**
   * 매출 패널 기본 상태 — API 응답 후 MetricHero("오늘 매출" + "₩0") 및
   * StatRows(평균 객단가 0원 · 최다 주문 시간대 행) 표시.
   * 신규 사장이라 deltaPct=0 → delta span "0%" 표시.
   */
  test('매출 패널 — 데이터 로드 후 0 값 표시', async ({ sellerPage }) => {
    await spaGoto(sellerPage, '/analytics')

    // 데이터 로드 완료 대기: 매출 히어로 라벨 "오늘 매출" 등장
    // (isPending || !data → "불러오는 중…" → 데이터 후 SalesPanel 렌더)
    // storeId 주입(useCurrentStoreStore) + analytics fetch 순차 대기 → 넉넉한 timeout
    await expect(sellerPage.getByText('오늘 매출')).toBeVisible({ timeout: 20_000 })

    // MetricHero — 라벨 "오늘 매출" + 값 "₩0" (formatWonSymbol(0))
    await expect(sellerPage.getByText('₩0')).toBeVisible()

    // delta span — deltaPct=0 → formatDelta(0) = { arrow:'', text:'0%' } → "0%"
    await expect(sellerPage.getByText('0%')).toBeVisible()

    // StatRows — 평균 객단가 행 (key·value)
    await expect(sellerPage.getByText('평균 객단가')).toBeVisible()
    // formatWon(0) = "0원"
    await expect(sellerPage.getByText('0원')).toBeVisible()

    // 최다 주문 시간대 행 — 신규=미집계이므로 키 존재 확인만 (값="" 가능)
    await expect(sellerPage.getByText('최다 주문 시간대')).toBeVisible()
  })

  /**
   * 기간 토글 전환 — 이번 주·이번 달·올해·오늘 순서로 클릭하며
   * aria-pressed 상태 전환 + 매출 히어로 라벨이 해당 기간으로 갱신되는지 검증.
   * 각 전환 후 신규 재조회가 완료될 때까지 15s 대기.
   */
  test('기간 토글 전환 — 4종 aria-pressed 및 매출 히어로 라벨 갱신', async ({
    sellerPage,
  }) => {
    await spaGoto(sellerPage, '/analytics')
    // 초기 로드 대기
    await expect(sellerPage.getByText('오늘 매출')).toBeVisible({ timeout: 20_000 })

    const periodGroup = sellerPage.getByRole('group', { name: '기간 선택' })

    // ── 이번 주 ──
    await periodGroup.getByRole('button', { name: '이번 주' }).click()
    await expect(periodGroup.getByRole('button', { name: '이번 주' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await expect(periodGroup.getByRole('button', { name: '오늘' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
    await expect(sellerPage.getByText('이번 주 매출')).toBeVisible({ timeout: 15_000 })

    // ── 이번 달 ──
    await periodGroup.getByRole('button', { name: '이번 달' }).click()
    await expect(periodGroup.getByRole('button', { name: '이번 달' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await expect(sellerPage.getByText('이번 달 매출')).toBeVisible({ timeout: 15_000 })

    // ── 올해 ──
    await periodGroup.getByRole('button', { name: '올해' }).click()
    await expect(periodGroup.getByRole('button', { name: '올해' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await expect(sellerPage.getByText('올해 매출')).toBeVisible({ timeout: 15_000 })

    // ── 오늘 (원위치) ──
    await periodGroup.getByRole('button', { name: '오늘' }).click()
    await expect(periodGroup.getByRole('button', { name: '오늘' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await expect(sellerPage.getByText('오늘 매출')).toBeVisible({ timeout: 15_000 })
  })

  /**
   * 주문 패널 전환 — aria-selected 전환 + StatRows 5행 렌더 + 신규 사장 0건/0% 표시.
   * pickupRate(0, 0) = 0 → "0%".
   */
  test('주문 패널 전환 — aria-selected 및 0 값 표시', async ({ sellerPage }) => {
    await spaGoto(sellerPage, '/analytics')
    await expect(sellerPage.getByText('오늘 매출')).toBeVisible({ timeout: 20_000 })

    const tabList = sellerPage.getByRole('tablist', { name: '통계 항목' })

    // 주문 탭 클릭
    await tabList.getByRole('tab', { name: '주문' }).click()
    await expect(tabList.getByRole('tab', { name: '주문' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    await expect(tabList.getByRole('tab', { name: '매출' })).toHaveAttribute(
      'aria-selected',
      'false',
    )

    // StatRows 5행 — 키 텍스트 확인
    // ★ '픽업 완료'는 '픽업 완료율'을 포함하므로 exact: true 로 구분
    await expect(sellerPage.getByText('총 주문')).toBeVisible()
    await expect(sellerPage.getByText('픽업 완료', { exact: true })).toBeVisible()
    await expect(sellerPage.getByText('취소')).toBeVisible()
    await expect(sellerPage.getByText('미수령(노쇼)')).toBeVisible()
    await expect(sellerPage.getByText('픽업 완료율')).toBeVisible()

    // 신규 사장 — 총 주문·픽업·취소·노쇼 모두 "0건" (first() 로 첫 행 확인)
    await expect(sellerPage.getByText('0건').first()).toBeVisible()
    // 픽업 완료율 "0%"
    await expect(sellerPage.getByText('0%')).toBeVisible()
  })

  /**
   * 떨이 패널 전환 — StatRows 4행 렌더 + 신규 사장 0개/0원/0% 표시.
   */
  test('떨이 패널 전환 — aria-selected 및 0 값 표시', async ({ sellerPage }) => {
    await spaGoto(sellerPage, '/analytics')
    await expect(sellerPage.getByText('오늘 매출')).toBeVisible({ timeout: 20_000 })

    const tabList = sellerPage.getByRole('tablist', { name: '통계 항목' })

    // 떨이 탭 클릭
    await tabList.getByRole('tab', { name: '떨이' }).click()
    await expect(tabList.getByRole('tab', { name: '떨이' })).toHaveAttribute(
      'aria-selected',
      'true',
    )

    // StatRows 4행 — 키 텍스트 확인
    await expect(sellerPage.getByText('마감 할인 판매 수량')).toBeVisible()
    await expect(sellerPage.getByText('폐기 절감 수량')).toBeVisible()
    await expect(sellerPage.getByText('폐기 절감 금액')).toBeVisible()
    await expect(sellerPage.getByText('평균 할인율')).toBeVisible()

    // 신규 사장 0 값 — soldQty/savedQty "0개"(first()), savedAmount "0원", avgDiscountRate "0%"
    await expect(sellerPage.getByText('0개').first()).toBeVisible()
    await expect(sellerPage.getByText('0원')).toBeVisible()
    await expect(sellerPage.getByText('0%')).toBeVisible()
  })

  /**
   * 리뷰 패널 전환 — MetricHero("평균 별점" + "⭐ 0.0") + StatRows 2행
   * + 빠른평가 섹션 h2 + 빈 상태("아직 집계된 태그가 없어요.") 확인.
   * topTags 는 count>0 필터 → 신규 사장은 모두 0 → 빈 상태.
   */
  test('리뷰 패널 전환 — 평균 별점 히어로 + 빈 빠른평가 태그 상태', async ({
    sellerPage,
  }) => {
    await spaGoto(sellerPage, '/analytics')
    await expect(sellerPage.getByText('오늘 매출')).toBeVisible({ timeout: 20_000 })

    const tabList = sellerPage.getByRole('tablist', { name: '통계 항목' })

    // 리뷰 탭 클릭
    await tabList.getByRole('tab', { name: '리뷰' }).click()
    await expect(tabList.getByRole('tab', { name: '리뷰' })).toHaveAttribute(
      'aria-selected',
      'true',
    )

    // MetricHero — "평균 별점" 라벨 + "⭐ 0.0" 값 (formatRating(0) = "0.0")
    await expect(sellerPage.getByText('평균 별점')).toBeVisible()
    await expect(sellerPage.getByText('⭐ 0.0')).toBeVisible()

    // StatRows — 신규 리뷰·답글 작성률 키 확인
    await expect(sellerPage.getByText('신규 리뷰')).toBeVisible()
    await expect(sellerPage.getByText('답글 작성률')).toBeVisible()

    // 빠른평가 섹션 h2 (role=heading)
    await expect(
      sellerPage.getByRole('heading', { name: '자주 언급된 빠른평가' }),
    ).toBeVisible()

    // 빈 상태 메시지 (tags.length === 0 분기)
    await expect(sellerPage.getByText('아직 집계된 태그가 없어요.')).toBeVisible()
  })
})
