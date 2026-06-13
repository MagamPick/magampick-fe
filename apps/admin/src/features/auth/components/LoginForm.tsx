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

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginInputSchema),
    defaultValues: { username: '', password: '' },
  })

  const onSubmit = (values: LoginInput) => {
    login.mutate(values)
  }

  // 인증 실패(401 / LOGIN_FAILED)는 존재 여부 비노출을 위해 서버 메시지 대신 단일 문구로 표시
  const serverError = (() => {
    if (!login.error) return null
    if (login.error instanceof ApiError) {
      if (login.error.status === 401 || login.error.code === 'LOGIN_FAILED') {
        return '아이디 또는 비밀번호를 확인해주세요'
      }
      return login.error.message
    }
    return '로그인 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.'
  })()

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem className="mb-4">
              <FormLabel>아이디</FormLabel>
              <FormControl>
                <Input type="text" autoComplete="username" placeholder="관리자 아이디" {...field} />
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

        {serverError && (
          <p role="alert" className="mb-3 mt-4 text-[13px] font-medium text-destructive">
            {serverError}
          </p>
        )}

        <button
          type="submit"
          disabled={login.isPending}
          className="mt-6 h-[54px] w-full rounded-xl bg-primary text-base font-bold tracking-[-0.3px] text-primary-foreground transition active:scale-[0.98] disabled:bg-muted disabled:text-muted-foreground disabled:active:scale-100"
        >
          {login.isPending ? '로그인 중...' : '로그인'}
        </button>
      </form>
    </Form>
  )
}
