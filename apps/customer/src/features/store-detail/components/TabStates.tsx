import type { ReactNode } from 'react'

/** 탭 안 빈/에러 안내 (떨이 0 · 메뉴 0 · 리뷰 0) */
export function TabEmpty({ children }: { children: ReactNode }) {
  return <p className="px-5 py-16 text-center text-sm text-muted-foreground">{children}</p>
}

/** 탭 로딩 스켈레톤 (행 3개) */
export function TabLoading() {
  return (
    <div className="space-y-3 px-5 py-5" aria-hidden>
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="size-[66px] flex-shrink-0 animate-pulse rounded-[12px] bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-2/3 animate-pulse rounded bg-muted" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  )
}

/** 영업 외(BREAK/CLOSED_TODAY) 탭 상단 차단 안내 */
export function OffBusinessNotice() {
  return (
    <p className="mx-5 mt-3 rounded-[10px] bg-background px-3 py-2 text-[12px] font-semibold text-muted-foreground">
      영업 외 상태예요 · 주문·담기는 영업 중에 가능해요
    </p>
  )
}
