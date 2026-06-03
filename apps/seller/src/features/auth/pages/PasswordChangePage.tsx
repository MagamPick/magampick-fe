import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router'
import { ChevronLeft, Check } from 'lucide-react'
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
import { passwordChangeSchema, passwordSchema, type PasswordChangeInput } from '../types'
import { usePasswordChange } from '../hooks/usePasswordChange'

/**
 * 비밀번호 변경 (로그인 상태 — 노션 「비밀번호 변경」 명세, 프로토타입 54-password-change).
 * 현재 비번 확인 → 새 비번 → 변경하기. 성공 후 현재 기기 로그인 유지(재로그인 X) — 완료 화면 후 진입점 복귀.
 * ProtectedRoute 로 로그인 전용(라우터에서 감쌈).
 */
export function PasswordChangePage() {
  const navigate = useNavigate()
  const changePassword = usePasswordChange()
  const [done, setDone] = useState(false)

  const form = useForm<PasswordChangeInput>({
    resolver: zodResolver(passwordChangeSchema),
    mode: 'onBlur',
    defaultValues: { currentPassword: '', newPassword: '', newPasswordConfirm: '' },
  })

  const v = form.watch()
  const formValid =
    !!v.currentPassword &&
    passwordSchema.safeParse(v.newPassword).success &&
    v.newPassword === v.newPasswordConfirm

  const onSubmit = (values: PasswordChangeInput) => {
    changePassword.mutate(
      { currentPassword: values.currentPassword, newPassword: values.newPassword },
      { onSuccess: () => setDone(true) },
    )
  }

  const serverError = ((): string | null => {
    const err = changePassword.error
    if (!err) return null
    return err instanceof ApiError ? err.message : '문제가 발생했어요. 잠시 후 다시 시도해주세요.'
  })()

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col bg-card">
      <header className="flex h-14 shrink-0 items-center gap-1 border-b border-border px-2">
        {!done && (
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="뒤로 가기"
            className="flex size-11 items-center justify-center"
          >
            <ChevronLeft className="size-[22px]" />
          </button>
        )}
        <span
          className={cn('text-[17px] font-bold tracking-tight text-foreground', done && 'pl-2')}
        >
          비밀번호 변경
        </span>
      </header>

      {done ? (
        <div className="flex min-h-0 flex-1 flex-col px-5 pb-4 pt-6">
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-[#eaf7ee] text-success">
              <Check className="size-10" strokeWidth={3} />
            </div>
            <h2 className="text-[23px] font-extrabold leading-snug tracking-tight text-foreground">
              비밀번호가
              <br />
              변경되었어요
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              변경된 비밀번호는 다음 로그인부터 사용해 주세요.
            </p>
            <div className="mt-6 w-full rounded-xl bg-background px-4 py-3 text-left text-[13px] leading-relaxed text-muted-foreground">
              💡 <b className="text-foreground">알림</b> · 다른 기기에서는 보안을 위해 다시 로그인이
              필요할 수 있어요.
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="h-[54px] w-full rounded-xl bg-primary text-base font-bold tracking-[-0.3px] text-white transition active:scale-[0.98]"
          >
            확인
          </button>
        </div>
      ) : (
        <Form {...form}>
          <form className="flex min-h-0 flex-1 flex-col" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex min-h-0 flex-1 flex-col px-5 pb-4 pt-6">
              <h2 className="text-[21px] font-extrabold leading-snug tracking-tight text-foreground">
                새 비밀번호로
                <br />
                변경해 주세요
              </h2>
              <p className="mb-7 mt-2 text-sm leading-relaxed text-muted-foreground">
                현재 비밀번호 확인 후 새 비밀번호를 입력하세요.
              </p>

              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel>
                      현재 비밀번호
                      <span aria-hidden="true" className="text-primary">
                        *
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        autoComplete="current-password"
                        placeholder="현재 비밀번호 입력"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel>
                      새 비밀번호
                      <span aria-hidden="true" className="text-primary">
                        *
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        autoComplete="new-password"
                        placeholder="새 비밀번호 입력"
                        {...field}
                      />
                    </FormControl>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                      8자 이상, 영문·숫자·특수문자를 포함해 주세요.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="newPasswordConfirm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      새 비밀번호 확인
                      <span aria-hidden="true" className="text-primary">
                        *
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        autoComplete="new-password"
                        placeholder="새 비밀번호 다시 입력"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="shrink-0 border-t border-border bg-card px-5 py-3">
              {serverError && (
                <p role="alert" className="mb-2.5 text-[13px] font-medium text-destructive">
                  {serverError}
                </p>
              )}
              <button
                type="submit"
                disabled={!formValid || changePassword.isPending}
                className="h-[54px] w-full rounded-xl bg-primary text-base font-bold tracking-[-0.3px] text-white transition active:scale-[0.98] disabled:bg-primary-disabled disabled:active:scale-100"
              >
                {changePassword.isPending ? '변경 중...' : '변경하기'}
              </button>
            </div>
          </form>
        </Form>
      )}
    </main>
  )
}
