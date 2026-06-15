import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Navigate, useLocation, useNavigate } from 'react-router'
import { ChevronLeft } from 'lucide-react'
import { Form } from '@/shared/components/ui/form'
import { ROUTES } from '@/shared/lib/routes'
import {
  socialSignupFormSchema,
  type SignupInput,
  type SocialSignupInput,
  type SocialSignupContext,
} from '../types'
import { useSocialSignup } from '../hooks/useSocialSignup'
import { useTerms } from '../hooks/useTerms'
import { SignupProgress } from '../components/SignupProgress'
import { Step1Terms } from '../components/Step1Terms'
import { Step3Phone } from '../components/Step3Phone'
import { Step4Address } from '../components/Step4Address'
import { Step5Profile } from '../components/Step5Profile'
import { TermsDialog } from '../components/TermsDialog'

const TOTAL_STEPS = 4
// 소셜 가입은 계정(이메일·비번) 스텝 생략 — 약관·본인인증·주소·닉네임 4단계 (회원가입 스텝 재사용)
const STEP_NAMES = ['약관 동의', '휴대폰 인증', '주소 등록', '프로필']

/**
 * 카카오 신규 회원 추가정보 위저드 (소셜 로그인 명세). 회원가입(소비자) 스텝 컴포넌트를 재사용하되
 * 계정 스텝을 빼고 4단계로 구성. 이메일은 카카오 제공값, 닉네임은 받았으면 prefill.
 * 폼은 SignupInput 형상을 공유하고 resolver 만 socialSignupFormSchema (password 미검증).
 * socialToken(15분)은 콜백(useKakaoLogin)이 location.state 로 넘긴다 — 제출 시 BE 가 신원 식별.
 */
export function SocialSignupPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const ctx = (location.state as SocialSignupContext | null) ?? null
  const socialSignup = useSocialSignup()
  const terms = useTerms()
  const [step, setStep] = useState(1)
  const [openTerm, setOpenTerm] = useState<number | null>(null)

  const form = useForm<SignupInput>({
    resolver: zodResolver(socialSignupFormSchema),
    mode: 'onBlur',
    defaultValues: {
      agreedTermIds: [],
      email: ctx?.email ?? '',
      password: '',
      passwordConfirm: '',
      name: '',
      phone: '',
      verificationToken: '',
      address: null,
      nickname: ctx?.nickname ?? '',
    },
  })

  const v = useWatch({ control: form.control })
  const agreedTermIds = v.agreedTermIds ?? []

  // 카카오 컨텍스트 없이 직접 진입(새로고침·딥링크) 차단 — 로그인부터 다시
  if (!ctx) return <Navigate to={ROUTES.LOGIN} replace />

  const stepValid = ((): boolean => {
    switch (step) {
      case 1:
        return (
          (terms.data?.length ?? 0) > 0 &&
          terms.data!.filter((t) => t.required).every((t) => agreedTermIds.includes(t.id))
        )
      case 2:
        return !!v.verificationToken
      case 3:
        return v.address !== null
      case 4:
        return (v.nickname ?? '').trim().length >= 2
      default:
        return false
    }
  })()

  const submit = () => {
    const values = form.getValues()
    if (!values.address) return
    const payload: SocialSignupInput = {
      socialToken: ctx.socialToken,
      email: ctx.email,
      agreedTermIds: values.agreedTermIds,
      name: values.name,
      phone: values.phone,
      verificationToken: values.verificationToken,
      address: values.address,
      nickname: values.nickname,
    }
    socialSignup.mutate(payload)
  }

  const goNext = () => {
    if (!stepValid) return
    if (step < TOTAL_STEPS) setStep((s) => s + 1)
    else submit()
  }
  const goPrev = () => {
    if (step > 1) setStep((s) => s - 1)
    else navigate(-1)
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col bg-card">
      <header className="flex h-14 shrink-0 items-center gap-1 border-b border-border px-2">
        <button
          type="button"
          onClick={goPrev}
          aria-label="뒤로 가기"
          className="flex size-11 items-center justify-center"
        >
          <ChevronLeft className="size-[22px]" />
        </button>
        <span className="text-[17px] font-bold tracking-tight text-foreground">카카오로 회원가입</span>
      </header>

      <SignupProgress step={step} stepNames={STEP_NAMES} />

      <Form {...form}>
        <form className="flex min-h-0 flex-1 flex-col" onSubmit={(e) => e.preventDefault()}>
          <div className="flex-1 px-5 pb-4 pt-6">
            {step === 1 && (
              <Step1Terms
                form={form}
                terms={terms.data ?? []}
                isLoading={terms.isPending}
                errorMessage={terms.isError ? '약관을 불러오지 못했어요' : undefined}
                onOpenTerms={setOpenTerm}
              />
            )}
            {step === 2 && <Step3Phone form={form} />}
            {step === 3 && <Step4Address form={form} />}
            {step === 4 && <Step5Profile form={form} />}
          </div>

          <div className="shrink-0 border-t border-border bg-card px-5 py-3">
            <div className="flex gap-2.5">
              {step > 1 && (
                <button
                  type="button"
                  onClick={goPrev}
                  className="h-[54px] w-24 shrink-0 rounded-xl bg-background text-base font-bold tracking-[-0.3px] text-muted-foreground transition active:scale-[0.98]"
                >
                  이전
                </button>
              )}
              <button
                type="button"
                onClick={goNext}
                disabled={!stepValid || socialSignup.isPending}
                className="h-[54px] flex-1 rounded-xl bg-primary text-base font-bold tracking-[-0.3px] text-white transition active:scale-[0.98] disabled:bg-primary-disabled disabled:active:scale-100"
              >
                {step < TOTAL_STEPS ? '다음' : socialSignup.isPending ? '가입 중...' : '가입 완료'}
              </button>
            </div>
          </div>
        </form>
      </Form>

      <TermsDialog terms={terms.data ?? []} termId={openTerm} onClose={() => setOpenTerm(null)} />
    </main>
  )
}
