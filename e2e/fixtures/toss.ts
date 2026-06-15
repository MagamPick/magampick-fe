import type { Page } from '@playwright/test'

/**
 * ⚠️ SCAFFOLD — 아직 미배선. 주문/결제 스윗에서 오케스트레이터가 직접 완성·검증한다 (e2e-plan §1·§5).
 *
 * 왜 지금 미완인가: 토스 "결제창"은 외부 호스팅 리다이렉트라 Playwright 가 직접 못 몲. 진짜 mock 은
 * (1) requestPayment 의 토스 도메인 이동을 가로채 successUrl 로 합성 리다이렉트 + (2) BE confirm
 * (POST /payments/confirm 류)이 합성 paymentKey 를 받아들이게 응답까지 가로채야 한다. (2)는 결제/주문
 * 코드(CheckoutPage·usePrepareAndPay·confirm 엔드포인트)를 읽어야 정확히 배선 가능 → 주문 스윗과 함께.
 *
 * 두 가지 전략 (주문 스윗에서 택1·문서화):
 *   A. successUrl 리다이렉트 + BE confirm 응답 route mock (완전 자동, BE 미접촉).
 *   B. 실 토스 샌드박스 결제창 1회 = 수동(오케스트레이터) — 라이브 왕복 1건만 사람손.
 *
 * 현재는 호출 시 명시적으로 throw 해서 "검증 안 된 mock 에 의존" 사고를 차단한다.
 */
export type TossMockOutcome = 'success' | 'fail'

export interface TossMockOptions {
  outcome?: TossMockOutcome
}

export async function installTossMock(_page: Page, _opts: TossMockOptions = {}): Promise<void> {
  throw new Error(
    'installTossMock 은 아직 미배선 (scaffold). 주문/결제 스윗 구축 시 오케스트레이터가 ' +
      'CheckoutPage·confirm 엔드포인트를 읽고 완성한다. e2e/fixtures/toss.ts 주석 참조.',
  )
}
