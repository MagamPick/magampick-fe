import { cn } from '@/shared/lib/utils'
import { statusToSegment } from '../lib/orderStatus'
import type { OrderStatus } from '../types'

/** 상태별 코드 안내 문구 (프로토타입 30-order-detail.js odCodeHint). */
function hintFor(status: OrderStatus): string {
  if (status === 'READY') return '고객에게 이 코드를 확인하고 픽업을 완료하세요'
  if (status === 'COMPLETED') return '픽업이 완료된 주문입니다'
  if (statusToSegment(status) === 'cancel') return '거절·취소된 주문입니다'
  return '준비 완료 후 고객에게 안내됩니다'
}

/**
 * 픽업 인증 코드 카드 (프로토타입 owner-v3 pickup-code).
 * 준비완료(READY)에서 강조(solid primary 테두리·primary 코드) — 손님 코드 대조용.
 */
export function PickupCodeCard({ code, status }: { code: string; status: OrderStatus }) {
  const active = status === 'READY'

  return (
    <div
      className={cn(
        'mt-3 rounded-[16px] border-[1.5px] p-[18px] text-center',
        active ? 'border-solid border-primary bg-secondary' : 'border-dashed border-border bg-card',
      )}
    >
      <div className="text-[12px] font-bold text-muted-foreground">픽업 인증 코드</div>
      <div
        className={cn(
          'my-1 pl-2 text-[38px] font-extrabold tracking-[8px]',
          active ? 'text-primary' : 'text-[#bdbdbd]',
        )}
      >
        {code}
      </div>
      <div className="text-[12px] font-semibold text-muted-foreground">{hintFor(status)}</div>
    </div>
  )
}
