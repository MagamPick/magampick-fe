/** sessionStorage 키 (토스 결제 준비 → success 페이지 복원용) */
const PAYMENT_SESSION_KEY = 'magampick_payment_session'

export interface PaymentSession {
  /** 주문 DB ID (PrepareOrderResponse.orderId) — confirm 엔드포인트에 사용 */
  orderId: number
  /** 결제 금액 — success URL 의 amount 쿼리와 교차검증 */
  amount: number
}

/**
 * 결제창 진입 직전 prepare 결과를 sessionStorage 에 저장.
 * 토스 리다이렉트로 React 메모리가 초기화되므로 success 페이지 복원 전까지 유지.
 */
export function stashPaymentSession(session: PaymentSession): void {
  sessionStorage.setItem(PAYMENT_SESSION_KEY, JSON.stringify(session))
}

/**
 * success 페이지에서 세션 복원. 없으면 null 반환.
 */
export function restorePaymentSession(): PaymentSession | null {
  const raw = sessionStorage.getItem(PAYMENT_SESSION_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as unknown
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      typeof (parsed as Record<string, unknown>).orderId === 'number' &&
      typeof (parsed as Record<string, unknown>).amount === 'number'
    ) {
      return parsed as PaymentSession
    }
    return null
  } catch {
    return null
  }
}

/**
 * confirm 완료 후 세션 정리.
 */
export function clearPaymentSession(): void {
  sessionStorage.removeItem(PAYMENT_SESSION_KEY)
}
