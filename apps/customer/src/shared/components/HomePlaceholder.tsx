import { useLogout } from '@/features/auth/hooks/useLogout'

/** 홈 placeholder — 홈 화면은 별도 기능으로 구현 예정 */
export function HomePlaceholder() {
  const logout = useLogout()
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-2 bg-background px-5 text-center">
      <h1 className="text-xl font-bold text-primary">마감픽 소비자</h1>
      <p className="text-sm text-muted-foreground">홈 화면 — 구현 예정</p>
      {/* 임시 — 마이페이지(로그아웃 메뉴) 구현 시 정식 위치로 이동하고 이 버튼은 제거 */}
      <button
        type="button"
        onClick={() => logout.mutate()}
        disabled={logout.isPending}
        className="mt-4 h-11 rounded-xl border border-border bg-card px-5 text-sm font-bold text-muted-foreground transition active:scale-[0.98] disabled:opacity-50"
      >
        {logout.isPending ? '로그아웃 중...' : '로그아웃 (임시)'}
      </button>
    </main>
  )
}
