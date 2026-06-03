import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { ComingSoonContext } from '../hooks/useComingSoon'

/**
 * "준비 중" 안내용 경량 스낵바 + 컨텍스트 Provider.
 * LoginForm 의 `role="status" aria-live="polite"` 안내 패턴을 흩어진 컨트롤(마이 메뉴 행 등)에서
 * 재사용할 수 있게 일반화. 앱 전역 토스트(sonner) 도입은 별도 chore.
 * 사장 앱은 바텀네비가 없어 토스트를 화면 하단(safe-area + 24)에 띄운다 (소비자는 바텀네비 위).
 */
export function ComingSoonProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const show = useCallback((msg: string) => {
    setMessage(msg)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setMessage(null), 2400)
  }, [])

  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), [])

  return (
    <ComingSoonContext.Provider value={{ show }}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed left-1/2 z-[60] flex w-full max-w-md -translate-x-1/2 justify-center px-4"
        style={{ bottom: 'calc(env(safe-area-inset-bottom, 24px) + 24px)' }}
      >
        {message && (
          <div className="pointer-events-auto rounded-full bg-foreground/90 px-4 py-2.5 text-center text-[13px] font-semibold text-white shadow-lg">
            {message}
          </div>
        )}
      </div>
    </ComingSoonContext.Provider>
  )
}
