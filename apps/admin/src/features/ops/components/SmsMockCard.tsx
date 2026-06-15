import { Button } from '@/shared/components/ui/button'
import { ApiError } from '@/shared/lib/apiError'
import { useSetSmsMock } from '../hooks/useSetSmsMock'

/**
 * SMS 발송기 mock/실발송 전환 카드.
 * 상태 조회(GET) API 가 없어 스테이트풀 토글/스위치 금지 — 단발 액션 버튼 2개(true/false POST).
 * "mock=false 로 시작한 서버에서만 전환" — 전환 실패 시 BE 에러를 그대로 표시.
 */
export function SmsMockCard() {
  const sms = useSetSmsMock()

  const success = sms.isSuccess
    ? sms.variables
      ? 'SMS를 mock 모드로 전환했어요.'
      : 'SMS를 실발송 모드로 전환했어요.'
    : null

  const error =
    sms.error instanceof ApiError
      ? sms.error.message
      : sms.error
        ? '전환 중 문제가 발생했어요. mock=false 로 시작한 서버인지 확인해 주세요.'
        : null

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h2 className="text-base font-bold text-foreground">SMS 발송 모드</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        현재 상태는 표시할 수 없습니다(조회 API 없음). 버튼은 즉시 적용됩니다.
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        mock=false 로 시작한 서버에서만 전환됩니다.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => sms.mutate(true)}
          disabled={sms.isPending}
        >
          mock으로 전환
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => sms.mutate(false)}
          disabled={sms.isPending}
        >
          실발송으로 전환
        </Button>
      </div>

      {success && (
        <p role="status" className="mt-4 text-sm font-semibold text-foreground">
          {success}
        </p>
      )}
      {error && (
        <p role="alert" className="mt-4 text-sm font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
