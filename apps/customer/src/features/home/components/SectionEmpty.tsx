import type { ReactNode } from 'react'

/** 섹션 결과 0건 안내 — 섹션을 숨기지 않고 한 줄 텍스트로 노출 (스펙). */
export function SectionEmpty({ children }: { children: ReactNode }) {
  return <p className="px-1 py-5 text-sm font-medium text-muted-foreground">{children}</p>
}
