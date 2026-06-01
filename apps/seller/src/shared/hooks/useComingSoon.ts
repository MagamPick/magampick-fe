import { createContext, useContext } from 'react'

export interface ComingSoonContextValue {
  /** 미구현 기능 탭 시 하단에 "준비 중" 안내를 띄운다 (silent no-op 금지). */
  show: (message: string) => void
}

export const ComingSoonContext = createContext<ComingSoonContextValue | null>(null)

export function useComingSoon() {
  const ctx = useContext(ComingSoonContext)
  if (!ctx) throw new Error('useComingSoon 은 ComingSoonProvider 안에서만 사용할 수 있어요.')
  return ctx
}
