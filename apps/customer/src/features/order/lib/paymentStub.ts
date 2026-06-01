const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

export interface TossPaymentRequest {
  /** 결제 금액 */
  amount: number
  /** 주문명 (결제창 표시용 — stub 단계에선 미사용) */
  orderName: string
}

export interface TossPaymentResult {
  approved: boolean
  paymentKey: string
}

/**
 * 토스페이 결제 — MVP **stub** (외부연동 stub-우선 원칙).
 * 결제창 없이 즉시 승인 성공 처리(노션: "stub 단계에서는 결제창 없이 승인 성공").
 *
 * ⚠️ 샌드박스 연동(swap) 지점 — 토스 SDK 연동 시 **이 함수 내부만** 결제창 호출 +
 * 승인 API 호출로 교체한다. 호출부(useCreateOrder)의 인터페이스는 그대로 유지.
 */
export async function requestTossPayment(req: TossPaymentRequest): Promise<TossPaymentResult> {
  await delay(600)
  return { approved: true, paymentKey: `stub_${req.amount}_${Date.now()}` }
}
