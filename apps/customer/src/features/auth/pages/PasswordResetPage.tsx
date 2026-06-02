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
import { ROUTES } from '@/shared/lib/routes'
import { passwordResetSchema, passwordSchema, type PasswordResetInput } from '../types'
import { usePasswordReset } from '../hooks/usePasswordReset'
import { PasswordResetPhoneStep } from '../components/PasswordResetPhoneStep'
import { PasswordResetNewPwStep } from '../components/PasswordResetNewPwStep'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * 비밀번호 재설정 — 이메일 → 휴대폰 본인인증(+매칭) → 새 비밀번호 → 완료 (노션 명세 3-step + 완료).
 * 자동 로그인 X — 완료 후 로그인 화면으로. PublicOnlyRoute 로 비로그인 전용(라우터에서 감쌈).
 */
export function PasswordResetPage() {
  const navigate = useNavigate()
  const { verifyIdentity, resetPassword } = usePasswordReset()
  const [step, setStep] = useState(1)
  const [resetToken, setResetToken] = useState('')

  const form = useForm<PasswordResetInput>({
    resolver: zodResolver(passwordResetSchema),
    mode: 'onBlur',
    defaultValues: {
      email: '',
      phone: '',
      verificationToken: '',
      newPassword: '',
      newPasswordConfirm: '',
    },
  })

  const v = form.watch()
  const stepValid = ((): boolean => {
    switch (step) {
      case 1:
        return EMAIL_RE.test(v.email)
      case 2:
        return !!v.verificationToken
      case 3:
        return (
          passwordSchema.safeParse(v.newPassword).success && v.newPassword === v.newPasswordConfirm
        )
      default:
        return true
    }
  })()

  const pending = verifyIdentity.isPending || resetPassword.isPending

  const goNext = () => {
    if (step === 1) {
      if (stepValid) setStep(2)
      return
    }
    if (step === 2) {
      if (!v.verificationToken) return
      verifyIdentity.mutate(
        { email: v.email, phone: v.phone, verificationToken: v.verificationToken },
        {
          onSuccess: ({ resetToken: token }) => {
            setResetToken(token)
            setStep(3)
          },
        },
      )
      return
    }
    if (step === 3) {
      if (!stepValid) return
      resetPassword.mutate(
        { resetToken, newPassword: v.newPassword },
        { onSuccess: () => setStep(4) },
      )
      return
    }
    navigate(ROUTES.LOGIN)
  }

  const goPrev = () => {
    if (step === 1) {
      navigate(-1)
      return
    }
    verifyIdentity.reset()
    resetPassword.reset()
    setStep((s) => s - 1)
  }

  const serverError = ((): string | null => {
    const err = step === 2 ? verifyIdentity.error : step === 3 ? resetPassword.error : null
    if (!err) return null
    return err instanceof ApiError ? err.message : '문제가 발생했어요. 잠시 후 다시 시도해주세요.'
  })()

  const ctaLabel =
    step === 1
      ? '다음'
      : step === 2
        ? verifyIdentity.isPending
          ? '확인 중...'
          : '다음'
        : step === 3
          ? resetPassword.isPending
            ? '변경 중...'
            : '완료'
          : '로그인하러 가기'

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col bg-card">
      <header className="flex h-14 shrink-0 items-center gap-1 border-b border-border px-2">
        {step < 4 && (
          <button
            type="button"
            onClick={goPrev}
            aria-label="뒤로 가기"
            className="flex size-11 items-center justify-center"
          >
            <ChevronLeft className="size-[22px]" />
          </button>
        )}
        <span
          className={cn(
            'text-[17px] font-bold tracking-tight text-foreground',
            step === 4 && 'pl-2',
          )}
        >
          비밀번호 찾기
        </span>
      </header>

      <Form {...form}>
        <form className="flex min-h-0 flex-1 flex-col" onSubmit={(e) => e.preventDefault()}>
          <div className="flex min-h-0 flex-1 flex-col px-5 pb-4 pt-6">
            {step === 1 && (
              <div>
                <h2 className="text-[21px] font-extrabold leading-snug tracking-tight text-foreground">
                  가입하신 이메일을
                  <br />
                  입력해 주세요
                </h2>
                <p className="mb-7 mt-2 text-sm leading-relaxed text-muted-foreground">
                  비밀번호를 재설정할 계정 이메일이에요.
                </p>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        이메일
                        <span aria-hidden="true" className="text-primary">
                          *
                        </span>
                      </FormLabel>
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
              </div>
            )}
            {step === 2 && <PasswordResetPhoneStep form={form} />}
            {step === 3 && <PasswordResetNewPwStep form={form} />}
            {step === 4 && (
              <div className="flex flex-1 flex-col items-center justify-center text-center">
                <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-[#eaf7ee] text-success">
                  <Check className="size-10" strokeWidth={3} />
                </div>
                <h2 className="text-[23px] font-extrabold leading-snug tracking-tight text-foreground">
                  비밀번호가
                  <br />
                  재설정되었어요
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  보안을 위해 새 비밀번호로
                  <br />
                  다시 로그인해 주세요.
                </p>
                <div className="mt-6 w-full rounded-xl bg-background px-4 py-3 text-left text-[13px] leading-relaxed text-muted-foreground">
                  💡 <b className="text-foreground">알림</b> · 기존에 로그인되어 있던 모든 기기에서
                  자동으로 로그아웃돼요.
                </div>
              </div>
            )}
          </div>

          <div className="shrink-0 border-t border-border bg-card px-5 py-3">
            {serverError && (
              <p role="alert" className="mb-2.5 text-[13px] font-medium text-destructive">
                {serverError}
              </p>
            )}
            <button
              type="button"
              onClick={goNext}
              disabled={!stepValid || pending}
              className="h-[54px] w-full rounded-xl bg-primary text-base font-bold tracking-[-0.3px] text-white transition active:scale-[0.98] disabled:bg-[#f0d9ce] disabled:active:scale-100"
            >
              {ctaLabel}
            </button>
          </div>
        </form>
      </Form>
    </main>
  )
}
