import { Link } from 'react-router'
import { LoginForm } from '../components/LoginForm'
import { ROUTES } from '@/shared/lib/routes'

/** 로그인 화면 — 서비스 첫 진입 (auth.md §4). 브랜드 + 로그인 폼 + 회원가입 진입점. */
export function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col bg-card px-5 pb-10 pt-6">
      <div className="flex flex-1 flex-col justify-center">
        <div className="text-center">
          <img src="/icons/icon-192.png" alt="" aria-hidden className="mx-auto size-[72px] rounded-full" />
          <h1 className="mt-3.5 text-[22px] font-extrabold tracking-[-0.6px] text-foreground">
            마감픽
          </h1>
          <p className="mt-1.5 text-sm font-medium text-muted-foreground">마감 직전, 절반 가격</p>
        </div>

        <div className="mt-[34px]">
          <LoginForm />
        </div>

        <p className="mt-4 text-center text-[13px] text-muted-foreground">
          아직 회원이 아니신가요?{' '}
          <Link to={ROUTES.SIGNUP} className="font-bold text-primary">
            회원가입
          </Link>
        </p>
      </div>
    </main>
  )
}
