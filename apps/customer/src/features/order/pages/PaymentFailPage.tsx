import { useNavigate, useSearchParams } from 'react-router'
import { XCircle } from 'lucide-react'
import { ScreenContainer } from '@/shared/components/ScreenContainer'
import { Button } from '@/shared/components/ui/button'
import { ROUTES } from '@/shared/lib/routes'
import { clearPaymentSession } from '../lib/paymentSession'

/**
 * 토스 결제창 실패/취소 리다이렉트 콜백 페이지.
 * URL 쿼리: code=ERROR_CODE, message=ERROR_MESSAGE, orderId=tossOrderId
 * 코드·메시지를 표시하고 결제 화면으로 돌아가는 버튼 제공.
 */
export function PaymentFailPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const code = searchParams.get('code') ?? ''
  const message = searchParams.get('message') ?? '결제에 실패했어요.'

  return (
    <ScreenContainer variant="page">
      <main className="flex flex-1 flex-col items-center justify-center gap-5 px-5 bg-card">
        <XCircle className="size-14 text-destructive" aria-hidden />
        <div className="text-center">
          <h1 className="text-[18px] font-bold text-foreground">결제에 실패했어요</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{message}</p>
          {code && (
            <p className="mt-1 text-xs text-muted-foreground">
              오류 코드: <span className="font-mono">{code}</span>
            </p>
          )}
        </div>

        <div className="flex w-full max-w-xs flex-col gap-2">
          <Button
            type="button"
            onClick={() => {
              clearPaymentSession()
              navigate(ROUTES.CHECKOUT, { replace: true })
            }}
            className="h-[52px] rounded-[12px] text-base font-bold"
          >
            다시 결제하기
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              clearPaymentSession()
              navigate(ROUTES.HOME, { replace: true })
            }}
            className="h-[52px] rounded-[12px] text-base font-bold"
          >
            홈으로
          </Button>
        </div>
      </main>
    </ScreenContainer>
  )
}
