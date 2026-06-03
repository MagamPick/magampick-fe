import { cn } from '@/shared/lib/utils'
import { timelineNodes } from '../lib/orderStatus'
import type { OrderStatus } from '../types'

/**
 * 사장 주문 상태 타임라인 (프로토타입 owner-v3 timeline / 06-detail.css).
 * 진행은 4노드(주문 접수→주문 수락→준비 완료→픽업 완료), 종료는 접수 + 종료 노드 2개.
 */
export function OrderTimeline({ status }: { status: OrderStatus }) {
  const nodes = timelineNodes(status)

  return (
    <div className="flex flex-col">
      {nodes.map((node, i) => {
        const last = i === nodes.length - 1
        return (
          <div key={`${node.label}-${i}`} className="flex gap-3">
            <div className="flex flex-shrink-0 flex-col items-center">
              <div
                className={cn(
                  'mt-0.5 size-[15px] flex-shrink-0 rounded-full border-2',
                  node.state === 'done' && 'border-primary bg-primary',
                  node.state === 'current' &&
                    'border-primary bg-card shadow-[0_0_0_3px_var(--secondary)]',
                  node.state === 'cancelled' && 'border-destructive bg-destructive',
                  node.state === 'upcoming' && 'border-border bg-card',
                )}
              />
              {!last && (
                <div
                  className={cn(
                    'min-h-5 w-0.5 flex-1',
                    node.state === 'done' ? 'bg-primary' : 'bg-border',
                  )}
                />
              )}
            </div>
            <div className={cn('pb-4', last && 'pb-0')}>
              <div
                className={cn(
                  'text-[14px] font-bold',
                  node.state === 'done' && 'text-foreground',
                  node.state === 'current' && 'text-primary',
                  (node.state === 'upcoming' || node.state === 'cancelled') &&
                    'text-muted-foreground',
                )}
              >
                {node.label}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
