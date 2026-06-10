import { loadTossPayments, ANONYMOUS } from '@tosspayments/tosspayments-sdk'
import { env } from '@/shared/lib/env'

export interface TossSdkPaymentParams {
  /** 결제 금액 (원) */
  amount: number
  /** 토스 주문 ID — PrepareOrderResponse.tossOrderId ('order-{orderId}' 형식) */
  orderId: string
  /** 결제창 표시용 주문명 */
  orderName: string
  /** 결제 성공 리다이렉트 URL */
  successUrl: string
  /** 결제 실패 리다이렉트 URL */
  failUrl: string
}

/**
 * 토스페이먼츠 SDK 결제창 호출 — 리다이렉트 모드.
 * 성공 시 successUrl?paymentType=…&amount=…&orderId=…&paymentKey=… 로 이동.
 * 실패/취소 시 failUrl?code=…&message=…&orderId=… 로 이동.
 *
 * ⚠️ VITE_TOSS_CLIENT_KEY 가 없으면 즉시 throw.
 * ⚠️ jsdom 에서 실 SDK 로드 금지 — 테스트는 반드시 vi.mock 으로 목킹.
 */
export async function requestTossPaymentSdk(params: TossSdkPaymentParams): Promise<void> {
  const clientKey = env.VITE_TOSS_CLIENT_KEY
  if (!clientKey) {
    throw new Error('VITE_TOSS_CLIENT_KEY 가 설정되지 않았습니다. .env 에 토스 클라이언트 키를 입력해 주세요.')
  }

  const toss = await loadTossPayments(clientKey)
  // TODO(실연동): 로그인 유저 id 를 customerKey 에 전달할 것 (현재 ANONYMOUS 고정)
  const payment = toss.payment({ customerKey: ANONYMOUS })

  // TODO(실연동): 토스페이 단독 노출 easyPay 옵션 확정
  //   현재: method='CARD' 통합결제창 (카드+간편결제 전체 노출)
  //   명세 목표: 토스페이 단독 → card.flowMode='DIRECT', card.easyPay='토스페이' 가 유력하나 미확인
  await payment.requestPayment({
    method: 'CARD',
    amount: { currency: 'KRW', value: params.amount },
    orderId: params.orderId,
    orderName: params.orderName,
    successUrl: params.successUrl,
    failUrl: params.failUrl,
  })
}
