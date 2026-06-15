import { test, expect } from '../../fixtures/seller-test'
import { spaGoto } from '../../fixtures/navigation'

/**
 * P7-03 사장 알림 센터 — 신규 사장 빈 상태 렌더
 *
 * 신규 사장(거래 0) → 알림 목록 빈 상태("새 알림이 없어요").
 * "모두 읽음" 버튼 존재·활성 확인.
 *
 * ★ P7-06 거래 알림 도착(완료 주문 선행)은 order/journey 단계 — 이 스윗 범위 제외.
 * ★ spaGotoFresh 금지 — 사장 앱은 하드 리로드 시 로그아웃됨.
 */
test.describe('P7-03 사장 알림 센터 — 빈 상태', () => {
  test('알림 센터가 렌더되고 빈 상태 메시지를 표시한다', async ({ sellerPage }) => {
    await spaGoto(sellerPage, '/notifications')

    // 헤더 제목
    await expect(sellerPage.getByRole('heading', { name: '알림' })).toBeVisible()

    // NotificationList 빈 상태 (notifications.length === 0)
    await expect(sellerPage.getByText('새 알림이 없어요')).toBeVisible()
  })

  test('"모두 읽음" 버튼이 헤더에 표시되고 활성 상태이다', async ({ sellerPage }) => {
    await spaGoto(sellerPage, '/notifications')
    await expect(sellerPage.getByRole('heading', { name: '알림' })).toBeVisible()

    // "모두 읽음" 버튼: isPending=false → disabled 아님
    const readAllBtn = sellerPage.getByRole('button', { name: '모두 읽음' })
    await expect(readAllBtn).toBeVisible()
    await expect(readAllBtn).toBeEnabled()
  })
})
