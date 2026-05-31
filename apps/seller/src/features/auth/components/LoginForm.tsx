import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/shared/components/ui/form'
import { Input } from '@/shared/components/ui/input'
import { ApiError } from '@/shared/lib/apiError'
import { useLogin } from '../hooks/useLogin'
import { loginInputSchema, type LoginInput } from '../types'

export function LoginForm() {
  const login = useLogin()
  // 비밀번호 찾기는 별도 명세(비밀번호 재설정, auth.md §13)라 이번 단계엔 "준비 중" 안내만.
  const [notice, setNotice] = useState<string | null>(null)

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginInputSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = (values: LoginInput) => {
    setNotice(null)
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

        <div className="mb-[22px] mt-2 flex justify-end">
          <button
            type="button"
            onClick={() => setNotice('비밀번호 찾기는 준비 중이에요.')}
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
          className="h-[54px] w-full rounded-xl bg-primary text-base font-bold tracking-[-0.3px] text-white transition active:scale-[0.98] disabled:bg-[#f0d9ce] disabled:active:scale-100"
        >
          {login.isPending ? '로그인 중...' : '로그인'}
        </button>

        {notice && (
          <p
            role="status"
            aria-live="polite"
            className="mt-3 text-center text-[13px] text-muted-foreground"
          >
            {notice}
          </p>
        )}
      </form>
    </Form>
  )
}
