import { test, expect } from '../../fixtures/test'
import { spaGoto } from '../../fixtures/navigation'

/**
 * P8 보조 — 포인트 화면 렌더 (신규 소비자 빈 상태)
 *
 * dev 실측 전제:
 *   - 신규 소비자 잔액 0P / pendingPoints 0 (완료 주문 없음)
 *   - 내역 없음 → EmptyState "해당 내역이 없어요."
 *   - pendingPoints=0 → PointHero 적립 예정 카드 미표시
 *
 * 결제에서의 포인트 사용·적립(P8-01·P8-02·P8-07)은 order/journey 단계 — 이 스윗 범위 제외.
 */
test.describe('포인트 — 빈 상태 렌더 (신규 계정)', () => {
  test('포인트 화면이 렌더되고 잔액 0P·빈 내역·적립 예정 숨김을 표시한다', async ({
    customerPage,
  }) => {
    await spaGoto(customerPage, '/mypage/points')

    // 화면 제목
    await expect(customerPage.getByRole('heading', { name: '포인트' })).toBeVisible()

    // PointHero — "사용 가능한 포인트" 라벨
    await expect(customerPage.getByText('사용 가능한 포인트')).toBeVisible()

    // 잔액 0P 표시 (balance.toLocaleString('ko-KR') = "0", 이후 " P" 텍스트 노드)
    await expect(customerPage.getByText(/^0\s+P$/)).toBeVisible()

    // 1P = 1원 안내 문구
    await expect(customerPage.getByText(/1P = 1원/)).toBeVisible()

    // pendingPoints=0 → "적립 예정" 카드 숨김
    await expect(customerPage.getByText('적립 예정')).not.toBeVisible()

    // 내역 탭 — 전체/적립/사용
    await expect(customerPage.getByRole('tab', { name: '전체' })).toBeVisible()
    await expect(customerPage.getByRole('tab', { name: '적립' })).toBeVisible()
    await expect(customerPage.getByRole('tab', { name: '사용' })).toBeVisible()

    // 내역 없음 → EmptyState
    await expect(customerPage.getByText('해당 내역이 없어요.')).toBeVisible()
  })

  test('적립·사용 탭 전환 시에도 빈 상태로 유지된다', async ({ customerPage }) => {
    await spaGoto(customerPage, '/mypage/points')
    await expect(customerPage.getByRole('heading', { name: '포인트' })).toBeVisible()

    // 적립 탭으로 전환
    await customerPage.getByRole('tab', { name: '적립' }).click()
    await expect(customerPage.getByText('해당 내역이 없어요.')).toBeVisible()

    // 사용 탭으로 전환
    await customerPage.getByRole('tab', { name: '사용' }).click()
    await expect(customerPage.getByText('해당 내역이 없어요.')).toBeVisible()
  })
})
