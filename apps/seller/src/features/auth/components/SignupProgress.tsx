import { Fragment } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

const STEP_NAMES = ['약관 동의', '계정 정보', '휴대폰 인증', '실명', '매장 등록']

// 프로토타입 renderStepTrack — 완료 노드는 체크표시, 현재 노드는 번호 + primary-light 링
export function SignupProgress({ step }: { step: number }) {
  const total = STEP_NAMES.length
  return (
    <div className="shrink-0 border-b border-border px-5 pb-3.5 pt-4">
      <div className="mb-2.5 flex items-center">
        {STEP_NAMES.map((_, i) => {
          const n = i + 1
          const done = n < step
          const current = n === step
          return (
            <Fragment key={n}>
              {i > 0 && (
                <span
                  className={cn('mx-[3px] h-0.5 flex-1', n - 1 < step ? 'bg-primary' : 'bg-border')}
                />
              )}
              <span
                className={cn(
                  'flex size-[26px] shrink-0 items-center justify-center rounded-full border-[1.5px] text-xs font-bold transition',
                  done || current
                    ? 'border-primary bg-primary text-white'
                    : 'border-border bg-background text-muted-foreground',
                  current && 'ring-4 ring-secondary',
                )}
              >
                {done ? <Check className="size-3.5" strokeWidth={3.5} /> : n}
              </span>
            </Fragment>
          )
        })}
      </div>
      <p className="text-[13px] font-semibold text-muted-foreground">
        STEP <b className="text-primary">{step}</b> / <b className="text-primary">{total}</b> ·{' '}
        {STEP_NAMES[step - 1]}
      </p>
    </div>
  )
}
