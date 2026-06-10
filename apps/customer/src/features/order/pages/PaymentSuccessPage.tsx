import { useEffect, useMemo, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { useMutation } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { ScreenContainer } from '@/shared/components/ScreenContainer'
import { Button } from '@/shared/components/ui/button'
import { ROUTES } from '@/shared/lib/routes'
import { paymentApi, mapToClientOrder } from '../api/paymentApi'
import { restorePaymentSession, clearPaymentSession } from '../lib/paymentSession'

type ConfirmParams =
  | { paymentKey: string; orderId: number; amount: number }
  | 'AMOUNT_MISMATCH'
  | null

/**
 * 토스 결제창 성공 리다이렉트 콜백 페이지 (VITE_USE_REAL_PAYMENT=true 경로).
 * URL 쿼리(paymentKey, orderId=tossOrderId, amount) + sessionStorage(orderId 숫자, amount) 복원
 * → amount 교차검증 → confirm API → 성공 시 OrderSuccessPage 로 이동.
 *
 * confirm 은 마운트 시 1회만 실행 (ref 가드). React Compiler eslint 안전:
 * useEffect 내에서 mutation.mutate() 를 호출하는 건 동기 setState 가 아님.
 */
export function PaymentSuccessPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // 마운트 1회만 파라미터를 계산 (URL+세션 불변)
  const confirmParams = useMemo<ConfirmParams>(() => {
    const paymentKey = searchParams.get('paymentKey')
    const session = restorePaymentSession()
    if (!paymentKey || !session) return null

    const urlAmount = Number(searchParams.get('amount'))
    if (urlAmount !== session.amount) return 'AMOUNT_MISMATCH'

    return { paymentKey, orderId: session.orderId, amount: session.amount }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // 의도적 빈 deps — 마운트 1회 고정

  const { mutate: confirm, isPending, isError, error } = useMutation({
    mutationFn: (p: { paymentKey: string; orderId: number; amount: number }) =>
      paymentApi.confirm(p),
    onSuccess: (data) => {
      clearPaymentSession()
      const order = mapToClientOrder(data)
      navigate(ROUTES.ORDER_SUCCESS, { state: { order }, replace: true })
    },
    onError: () => {
      clearPaymentSession()
    },
  })

  // confirm 1회 트리거 — mutate() 는 동기 setState 가 아니므로 React Compiler 안전
  const hasConfirmed = useRef(false)
  useEffect(() => {
    if (hasConfirmed.current) return
    if (!confirmParams || confirmParams === 'AMOUNT_MISMATCH') return
    hasConfirmed.current = true
    confirm(confirmParams)
  }, [confirm, confirmParams])

  // ── 금액 불일치 ───────────────────────────────────────────────────────────
  if (confirmParams === 'AMOUNT_MISMATCH') {
    return (
      <ScreenContainer variant="page">
        <main className="flex flex-1 flex-col items-center justify-center gap-4 px-5 bg-card">
          <p className="text-center text-sm text-destructive">
            결제 금액이 맞지 않아 처리할 수 없어요.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(ROUTES.CHECKOUT, { replace: true })}
            className="rounded-[12px]"
          >
            결제 화면으로 돌아가기
          </Button>
        </main>
      </ScreenContainer>
    )
  }

  // ── 세션/파라미터 없음 ──────────────────────────────────────────────────────
  if (!confirmParams) {
    return (
      <ScreenContainer variant="page">
        <main className="flex flex-1 flex-col items-center justify-center gap-4 px-5 bg-card">
          <p className="text-center text-sm text-muted-foreground">잘못된 접근이에요.</p>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(ROUTES.HOME, { replace: true })}
            className="rounded-[12px]"
          >
            홈으로
          </Button>
        </main>
      </ScreenContainer>
    )
  }

  // ── confirm 오류 ──────────────────────────────────────────────────────────
  if (isError) {
    const message =
      error instanceof Error ? error.message : '결제 확인 중 오류가 발생했어요.'
    return (
      <ScreenContainer variant="page">
        <main className="flex flex-1 flex-col items-center justify-center gap-4 px-5 bg-card">
          <p className="text-center text-sm text-destructive">{message}</p>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(ROUTES.CHECKOUT, { replace: true })}
            className="rounded-[12px]"
          >
            결제 화면으로 돌아가기
          </Button>
        </main>
      </ScreenContainer>
    )
  }

  // ── 처리 중 ───────────────────────────────────────────────────────────────
  return (
    <ScreenContainer variant="page">
      <main className="flex flex-1 flex-col items-center justify-center gap-3 bg-card">
        {isPending && <Loader2 className="size-8 animate-spin text-primary" aria-hidden />}
        <p className="text-sm text-muted-foreground">결제를 확인하는 중이에요…</p>
      </main>
    </ScreenContainer>
  )
}
