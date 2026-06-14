import { test, expect } from '../../fixtures/test'
import { spaGoto } from '../../fixtures/navigation'

/**
 * P4-07 매장 위치 sub-route (/store/{id}/location)
 *
 * StoreLocationPage: 카카오맵 + 하단 카드(매장명·거리·도보시간).
 * GPS = SEED_GPS(강남 테헤란로), fallback = 기본 주소지.
 * walkAndDistanceLabel = "도보 N분 · X.Xkm" 형식.
 * 줌 컨트롤: aria-label="확대" / "축소" 버튼.
 */

const STORE_ID = 27 // 서경분식

test.describe('P4-07 매장 위치', () => {
  test('"매장 위치" 제목이 표시된다', async ({ customerPage }) => {
    await spaGoto(customerPage, `/store/${STORE_ID}/location`)
    await expect(customerPage.getByText('매장 위치')).toBeVisible()
  })

  test('하단 카드에 매장명(서경분식)이 표시된다', async ({ customerPage }) => {
    await spaGoto(customerPage, `/store/${STORE_ID}/location`)
    // StoreLocationPage 하단 카드: {store?.name}
    await expect(customerPage.getByText('서경분식')).toBeVisible()
  })

  test('도보 정보("도보 N분") 카드가 표시된다', async ({ customerPage }) => {
    await spaGoto(customerPage, `/store/${STORE_ID}/location`)
    // walkAndDistanceLabel(gpsDistanceKm) = "도보 N분 · X.Xkm"
    // GPS(강남) ↔ 서경분식(성북) 약 12km → 도보 180분 정도
    await expect(customerPage.getByText(/도보 \d+분/)).toBeVisible()
  })

  /**
   * ★ FINDING (dev): P4-05 와 동일 원인 — 카카오맵 미초기화(kakao.maps undefined)로 줌 컨트롤이
   * 렌더되지 않는다. JS 키 도메인 등록되면 이 test.fail 이 통과로 뒤집힌다. (제목·매장명·도보 카드는 정상.)
   */
  test('지도 줌 컨트롤(확대·축소 버튼)이 표시된다', async ({ customerPage }) => {
    test.fail(true, 'P4-07 dev 카카오맵 미초기화 — 줌 컨트롤 미렌더 (P4-05 동일 원인)')
    await spaGoto(customerPage, `/store/${STORE_ID}/location`)
    await expect(customerPage.getByText('서경분식')).toBeVisible() // 매장 데이터 로드 = 렌더 완료
    await expect(customerPage.getByRole('button', { name: '확대' })).toBeVisible({ timeout: 6_000 })
    await expect(customerPage.getByRole('button', { name: '축소' })).toBeVisible()
  })
})
