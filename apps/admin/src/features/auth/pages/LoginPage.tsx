import { LoginForm } from '../components/LoginForm'

/**
 * 관리자 로그인 화면 — 내부 운영 도구 진입 (BE /auth/admin/login).
 * 데스크톱 전제: 중앙 정렬 카드. 가입·비밀번호 찾기·소셜 진입점 없음.
 */
export function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-e2">
        <div className="mb-8 text-center">
          <h1 className="text-display font-extrabold tracking-[-0.6px] text-foreground">
            마감픽 <span className="text-primary">관리자</span>
          </h1>
          <p className="mt-2 text-sm font-medium text-muted-foreground">운영 관리 콘솔</p>
        </div>

        <LoginForm />
      </div>
    </main>
  )
}
