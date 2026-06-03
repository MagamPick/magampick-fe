import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/shared/components/ui/form'
import { Input } from '@/shared/components/ui/input'
import { cn } from '@/shared/lib/utils'
import { ApiError } from '@/shared/lib/apiError'
import { ROUTES } from '@/shared/lib/routes'
import { useLogin } from '../hooks/useLogin'
import { loginInputSchema, type LoginInput } from '../types'
import { KakaoMockScenarios } from './KakaoMockScenarios'

export function LoginForm() {
  const navigate = useNavigate()
  const login = useLogin()

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginInputSchema),
    defaultValues: { email: '', password: '', keepSignedIn: true },
  })

  const onSubmit = (values: LoginInput) => {
    login.mutate(values)
  }

  const serverError =
    login.error instanceof ApiError
      ? login.error.message
      : login.error
        ? '로그인 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.'
        : null

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="mb-4">
              <FormLabel>이메일</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  inputMode="email"
                  autoComplete="username"
                  placeholder="example@magampick.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>비밀번호</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  autoComplete="current-password"
                  placeholder="비밀번호 입력"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="mb-[22px] mt-1 flex items-center justify-between">
          <FormField
            control={form.control}
            name="keepSignedIn"
            render={({ field }) => (
              <button
                type="button"
                role="checkbox"
                aria-checked={field.value}
                aria-label="로그인 상태 유지"
                onClick={() => field.onChange(!field.value)}
                className="flex min-h-11 items-center gap-2 py-1.5"
              >
                <span
                  className={cn(
                    'flex size-6 items-center justify-center rounded-[7px] border-[1.5px] transition',
                    field.value
                      ? 'border-primary bg-primary text-white'
                      : 'border-border bg-card text-transparent',
                  )}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-3.5"
                    aria-hidden="true"
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span className="text-[13px] font-semibold text-muted-foreground">
                  로그인 상태 유지
                </span>
              </button>
            )}
          />
          <button
            type="button"
            onClick={() => navigate(ROUTES.PASSWORD_RESET)}
            className="inline-flex min-h-11 items-center px-1 py-1.5 text-[13px] font-semibold text-muted-foreground"
          >
            비밀번호 찾기
          </button>
        </div>

        {serverError && (
          <p role="alert" className="mb-3 text-[13px] font-medium text-destructive">
            {serverError}
          </p>
        )}

        <button
          type="submit"
          disabled={login.isPending}
          className="h-[54px] w-full rounded-xl bg-primary text-base font-bold tracking-[-0.3px] text-white transition active:scale-[0.98] disabled:bg-primary-disabled disabled:active:scale-100"
        >
          {login.isPending ? '로그인 중...' : '로그인'}
        </button>

        <div className="mb-[14px] mt-[22px] flex items-center gap-3">
          <span className="h-px flex-1 bg-border" />
          <span className="text-xs font-semibold text-placeholder">또는</span>
          <span className="h-px flex-1 bg-border" />
        </div>

        {/* 카카오로 시작하기 — mock 에선 콜백 화면으로 (신규·이메일 동의 happy path).
            실연동 시: window.location 으로 카카오 호스팅 OAuth 페이지로 리다이렉트. */}
        <button
          type="button"
          onClick={() => navigate(ROUTES.KAKAO_CALLBACK, { state: { scenario: 'new_email' } })}
          className="flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-[#FEE500] text-[15px] font-bold text-[#191600] transition active:scale-[0.98]"
        >
          <span className="text-[17px]" aria-hidden="true">
            💬
          </span>
          카카오로 시작하기
        </button>

        <KakaoMockScenarios />
      </form>
    </Form>
  )
}
