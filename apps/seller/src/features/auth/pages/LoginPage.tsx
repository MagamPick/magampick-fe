import { Link } from 'react-router'
import { Megaphone } from 'lucide-react'
import { LoginForm } from '../components/LoginForm'
import { ROUTES } from '@/shared/lib/routes'

/** 로그인 화면 — 사장 서비스 첫 진입 (auth.md §4). 브랜드 + 로그인 폼 + 회원가입 진입점 + 소비자 안내. */
export function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col bg-card px-5 pb-10 pt-6">
      <div className="mt-10 text-center">
        <img src="/icons/icon-192.png" alt="" aria-hidden className="mx-auto size-[72px] rounded-full" />
        <h1 className="mt-3.5 text-[22px] font-extrabold tracking-[-0.6px] text-foreground">
          마감픽 사장님
        </h1>
        <p className="mt-1.5 text-sm font-medium text-muted-foreground">
          사장님을 위한 마감 세일 파트너
        </p>
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

      <div className="mt-8 flex items-start gap-2.5 rounded-xl bg-secondary px-4 py-3.5">
        <Megaphone aria-hidden className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        <p className="text-[12.5px] leading-relaxed text-muted-foreground">
          <b className="font-bold text-foreground">소비자이신가요?</b>
          <br />
          주변 마감 할인 상품을 찾으신다면 마감픽 고객용 앱을 이용해 주세요. 이 앱은 매장 운영
          전용입니다.
        </p>
      </div>
    </main>
  )
}
