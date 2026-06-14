import { test, expect } from '../fixtures/test'
import { spaGoto } from '../fixtures/navigation'

/**
 * fixtures 자체 점검 (인프라 카나리) — 기능 스펙 아님.
 * 매 테스트가 dev 에 새 소비자를 가입시키고(격리), refresh 쿠키로 인증 부팅되는지 확인한다.
 * customer/addresses 기능 스윗과 분리 — 건드리지 말 것.
 */
test.describe('fixtures 인프라 점검', () => {
  test('새 소비자로 인증 부팅되고 가입 기본 주소가 보인다', async ({ customerPage }) => {
    // 보호 라우트 — 인증 실패면 /login 으로 튕겨 heading 이 안 뜬다.
    // dev 는 deep-link 404 라 spaGoto(클라 라우팅)로만 이동.
    await spaGoto(customerPage, '/addresses')
    await expect(customerPage.getByRole('heading', { name: '주소 설정' })).toBeVisible()

    // 가입 시 동반된 기본 주소 1개 (서경로 2) — 데이터 격리(빈 상태 아님) 동시 확인
    await expect(customerPage.getByText('기본 주소')).toBeVisible()
    await expect(customerPage.getByText('서경로 2')).toBeVisible()
  })
})
