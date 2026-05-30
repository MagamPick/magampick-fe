import { useState, useEffect } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { Check } from 'lucide-react'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/shared/components/ui/form'
import { Input } from '@/shared/components/ui/input'
import { formatPhone } from '@/shared/lib/formatPhone'
import { usePhoneVerification } from '../hooks/usePhoneVerification'
import type { SignupInput } from '../types'

export function Step3Phone({ form }: { form: UseFormReturn<SignupInput> }) {
  const { request, verify } = usePhoneVerification()
  const [codeSent, setCodeSent] = useState(false)
  const [otp, setOtp] = useState('')
  const [timer, setTimer] = useState(0)

  const phone = form.watch('phone')
  const verified = !!form.watch('verificationToken')
  // 프로토타입 refreshSendCodeBtn — 010 11자리 (실명은 Step 4 에서 별도 자기 신고)
  const canSend = /^010-\d{4}-\d{4}$/.test(phone ?? '')

  useEffect(() => {
    if (timer <= 0) return
    const id = setInterval(() => setTimer((t) => Math.max(0, t - 1)), 1000)
    return () => clearInterval(id)
  }, [timer])

  const sendCode = () =>
    request.mutate(phone, {
      onSuccess: () => {
        setCodeSent(true)
        setTimer(180)
      },
    })

  const verifyCode = () =>
    verify.mutate(
      { phone, code: otp },
      {
        onSuccess: ({ verificationToken }) =>
          form.setValue('verificationToken', verificationToken, { shouldValidate: true }),
      },
    )

  const mmss = `${Math.floor(timer / 60)}:${String(timer % 60).padStart(2, '0')}`

  return (
    <div>
      <h2 className="text-[21px] font-extrabold leading-snug tracking-tight text-foreground">
        휴대폰 본인인증을
        <br />
        완료해 주세요
      </h2>
      <p className="mb-7 mt-2 text-sm leading-relaxed text-muted-foreground">
        정산·세금계산서 발행을 위해 본인확인이 필요해요.
      </p>

      <FormField
        control={form.control}
        name="phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              휴대폰 번호<span aria-hidden="true" className="text-primary">*</span>
            </FormLabel>
            <div className="relative">
              <FormControl>
                <Input
                  type="tel"
                  inputMode="numeric"
                  placeholder="010-0000-0000"
                  maxLength={13}
                  className="pr-[116px]"
                  name={field.name}
                  ref={field.ref}
                  value={field.value}
                  onBlur={field.onBlur}
                  onChange={(e) => field.onChange(formatPhone(e.target.value))}
                  readOnly={verified}
                />
              </FormControl>
              <button
                type="button"
                disabled={!canSend || verified || request.isPending}
                onClick={sendCode}
                className="absolute right-1.5 top-1/2 h-11 -translate-y-1/2 rounded-lg bg-secondary px-3.5 text-[13px] font-bold text-secondary-foreground disabled:opacity-50"
              >
                {codeSent && !verified ? '재전송' : '인증번호 받기'}
              </button>
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              ‘-’ 없이 숫자만 입력해도 자동 입력돼요.
            </p>
            <FormMessage />
          </FormItem>
        )}
      />

      {codeSent && !verified && (
        <div className="mt-4">
          <label
            htmlFor="otp"
            className="mb-1.5 flex gap-0.5 text-[13px] font-semibold text-foreground"
          >
            인증번호<span aria-hidden="true" className="text-primary">*</span>
          </label>
          <div className="relative">
            <Input
              id="otp"
              inputMode="numeric"
              placeholder="6자리 숫자"
              maxLength={6}
              value={otp}
              className="pr-[104px] text-center text-[18px] font-bold tracking-[8px]"
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            />
            <button
              type="button"
              disabled={otp.length !== 6 || verify.isPending}
              onClick={verifyCode}
              className="absolute right-1.5 top-1/2 h-11 -translate-y-1/2 rounded-lg bg-secondary px-3.5 text-[13px] font-bold text-secondary-foreground disabled:opacity-50"
            >
              인증 확인
            </button>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <button
              type="button"
              className="text-[12.5px] font-bold text-secondary-foreground disabled:text-muted-foreground"
              disabled={timer > 120}
              onClick={sendCode}
            >
              ↺ 인증번호 재전송
            </button>
            {timer > 0 && (
              <span className="text-[13px] font-bold tabular-nums text-destructive">{mmss}</span>
            )}
          </div>
          {verify.error && (
            <p className="mt-1.5 text-xs text-destructive">{(verify.error as Error).message}</p>
          )}
        </div>
      )}

      {verified && (
        <div className="mt-2 flex items-center gap-2 rounded-xl bg-[#eaf7ee] p-3.5 text-success">
          <Check className="size-4" strokeWidth={3} />
          <span className="text-[13.5px] font-bold">휴대폰 인증이 완료되었습니다</span>
        </div>
      )}
    </div>
  )
}
