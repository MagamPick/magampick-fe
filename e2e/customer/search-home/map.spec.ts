import { test, expect } from '../../fixtures/test'
import { spaGoto } from '../../fixtures/navigation'

/**
 * P4-05 지도 탭 (/map)
 *
 * MapFilterBar: 거리 1/3/5km 칩(단일 선택, aria-pressed) + "마감 할인 판매 중" 토글.
 * 기본: 거리 3km · 토글 ON.
 * KakaoMapView: 외부 SDK — 마커 픽셀 단언 불가. 컨테이너 렌더 + SDK 에러 여부 확인 수준.
 * GPS = SEED_GPS(강남 테헤란로 105) — permissions:['geolocation'] 로 자동 허용.
 */

test.describe('P4-05 지도', () => {
  test('거리 필터 칩 3종(1km·3km·5km)이 표시된다', async ({ customerPage }) => {
    await spaGoto(customerPage, '/map')
    await expect(customerPage.getByRole('button', { name: '1km' })).toBeVisible()
    await expect(customerPage.getByRole('button', { name: '3km' })).toBeVisible()
    await expect(customerPage.getByRole('button', { name: '5km' })).toBeVisible()
  })

  test('기본 반경은 3km (aria-pressed=true)', async ({ customerPage }) => {
    await spaGoto(customerPage, '/map')
    await expect(customerPage.getByRole('button', { name: '3km' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await expect(customerPage.getByRole('button', { name: '1km' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  test('5km 클릭 → 5km 활성, 3km 비활성', async ({ customerPage }) => {
    await spaGoto(customerPage, '/map')
    await customerPage.getByRole('button', { name: '5km' }).click()
    await expect(customerPage.getByRole('button', { name: '5km' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await expect(customerPage.getByRole('button', { name: '3km' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  test('"마감 할인 판매 중" 토글 레이블이 표시된다', async ({ customerPage }) => {
    await spaGoto(customerPage, '/map')
    // MapFilterBar: <label>마감 할인 판매 중<Switch /></label>
    await expect(customerPage.getByText('마감 할인 판매 중')).toBeVisible()
  })

  /**
   * ★ FINDING (dev): /map 에서 카카오맵이 초기화되지 않는다 — sdk.js 는 로드되나(window.kakao 존재)
   * `kakao.maps` 가 undefined 로 남아 "지도를 불러오지 못했어요" 에러 UI 가 뜬다. headless·headed 동일,
   * 콘솔 에러 없음 → **테스트 환경 한정 아님**: 카카오 JS 키(c9e18bcd…)의 도메인 화이트리스트에
   * dev.magampick.com 이 미등록인 정황(실 사용자도 같은 origin → 동일 영향 추정, 실기기 확인 필요).
   * 키 등록되면 이 test.fail 이 통과로 뒤집혀 마커 제거를 요구한다. (필터바 테스트는 정상 — 카카오 무관.)
   */
  test('지도 컨테이너가 카카오맵 SDK 에러 없이 렌더된다', async ({ customerPage }) => {
    test.fail(true, 'P4-05 dev 카카오맵 미초기화(kakao.maps undefined) — JS 키 도메인 등록 필요')
    await spaGoto(customerPage, '/map')
    await expect(customerPage.getByRole('button', { name: '3km' })).toBeVisible()
    await expect(customerPage.getByText('지도를 불러오지 못했어요')).not.toBeVisible({ timeout: 6_000 })
  })
})
