import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'
import type { DeltaTone } from '../lib/analyticsFormat'

const DELTA_TONE_CLASS: Record<DeltaTone, string> = {
  up: 'text-success',
  down: 'text-destructive',
  flat: 'text-muted-foreground',
}

const DELTA_TONE_LABEL: Record<DeltaTone, string> = {
  up: '증가',
  down: '감소',
  flat: '변동 없음',
}

interface Props {
  label: string
  /** 큰 숫자 표시값 (이미 포맷됨 — "₩380,000", 또는 아이콘+숫자 ReactNode) */
  value: ReactNode
  /** 전기 대비 증감 (매출 패널만; 리뷰 등은 생략) */
  delta?: { tone: DeltaTone; arrow: string; text: string }
}

/** 패널 상단 핵심 지표 히어로 (프로토타입 `.metric-hero`) — 라벨 + 큰 값 (+ 증감). */
export function MetricHero({ label, value, delta }: Props) {
  return (
    <div className="px-5 pt-1.5">
      <p className="text-[13px] font-semibold text-muted-foreground">{label}</p>
      <p className="mt-[5px] text-[28px] font-extrabold tracking-[-1px] text-foreground">
        <span>{value}</span>
        {delta && (
          <span
            className={cn('ml-2 text-[13px] font-bold', DELTA_TONE_CLASS[delta.tone])}
            aria-label={`전기 대비 ${DELTA_TONE_LABEL[delta.tone]} ${delta.text}`}
          >
            {delta.arrow ? `${delta.arrow} ` : ''}
            {delta.text}
          </span>
        )}
      </p>
    </div>
  )
}
