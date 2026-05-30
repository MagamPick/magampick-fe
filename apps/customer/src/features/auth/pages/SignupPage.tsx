import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router'
import { ChevronLeft } from 'lucide-react'
import { Form } from '@/shared/components/ui/form'
import {
  signupInputSchema,
  passwordSchema,
  REQUIRED_TERM_IDS,
  type SignupInput,
  type TermId,
} from '../types'
import { useSignup } from '../hooks/useSignup'
import { SignupProgress } from '../components/SignupProgress'
import { Step1Terms } from '../components/Step1Terms'
import { Step2Account } from '../components/Step2Account'
import { Step3Phone } from '../components/Step3Phone'
import { Step4Address } from '../components/Step4Address'
import { Step5Profile } from '../components/Step5Profile'
import { TermsDialog } from '../components/TermsDialog'

const TOTAL_STEPS = 5
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function SignupPage() {
  const navigate = useNavigate()
  const signup = useSignup()
  const [step, setStep] = useState(1)
  const [openTerm, setOpenTerm] = useState<TermId | null>(null)

  const form = useForm<SignupInput>({
    resolver: zodResolver(signupInputSchema),
    mode: 'onBlur',
    defaultValues: {
      agreedTermIds: [],
      email: '',
      password: '',
      passwordConfirm: '',
      name: '',
      phone: '',
      verificationToken: '',
      address: '',
      nickname: '',
    },
  })

  // 프로토타입 refreshSignupCta — 단계 조건 충족 시에만 「다음」 활성
  const v = form.watch()
  const stepValid = ((): boolean => {
    switch (step) {
      case 1:
        return REQUIRED_TERM_IDS.every((t) => v.agreedTermIds.includes(t))
      case 2:
        return (
          EMAIL_RE.test(v.email) &&
          passwordSchema.safeParse(v.password).success &&
          v.password === v.passwordConfirm
        )
      case 3:
        return !!v.verificationToken
      case 4:
        return v.address.trim().length > 0
      case 5:
        return v.nickname.trim().length >= 2
      default:
        return false
    }
  })()

  const goNext = () => {
    if (!stepValid) return
    if (step < TOTAL_STEPS) setStep((s) => s + 1)
    else form.handleSubmit((values) => signup.mutate(values))()
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
        <span className="text-[17px] font-bold tracking-tight text-foreground">회원가입</span>
      </header>

      <SignupProgress step={step} />

      <Form {...form}>
        <form className="flex min-h-0 flex-1 flex-col" onSubmit={(e) => e.preventDefault()}>
          <div className="flex-1 px-5 pb-4 pt-6">
            {step === 1 && <Step1Terms form={form} onOpenTerms={setOpenTerm} />}
            {step === 2 && <Step2Account form={form} />}
            {step === 3 && <Step3Phone form={form} />}
            {step === 4 && <Step4Address form={form} />}
            {step === 5 && <Step5Profile form={form} />}
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
                disabled={!stepValid || signup.isPending}
                className="h-[54px] flex-1 rounded-xl bg-primary text-base font-bold tracking-[-0.3px] text-white transition active:scale-[0.98] disabled:bg-[#f0d9ce] disabled:active:scale-100"
              >
                {step < TOTAL_STEPS ? '다음' : signup.isPending ? '가입 중...' : '가입 완료'}
              </button>
            </div>
          </div>
        </form>
      </Form>

      <TermsDialog termId={openTerm} onClose={() => setOpenTerm(null)} />
    </main>
  )
}
