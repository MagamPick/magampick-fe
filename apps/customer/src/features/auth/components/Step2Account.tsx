import type { UseFormReturn } from 'react-hook-form'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/shared/components/ui/form'
import { Input } from '@/shared/components/ui/input'
import { cn } from '@/shared/lib/utils'
import { useEmailCheck } from '../hooks/useEmailCheck'
import type { SignupInput } from '../types'

// 강도 게이지 — 영문·숫자·특수 3종을 갖춘 뒤 길이로 구분 (10자~ 보통 · 12자~ 강함).
// 검증(통과 여부)은 passwordSchema 가 따로 담당하므로 여기선 시각 피드백만.
function pwStrength(pw: string): 0 | 1 | 2 | 3 {
  if (!pw) return 0
  const hasAllClasses = /[A-Za-z]/.test(pw) && /\d/.test(pw) && /[^A-Za-z\d]/.test(pw)
  if (!hasAllClasses) return 1
  if (pw.length >= 12) return 3
  if (pw.length >= 10) return 2
  return 1
}

export function Step2Account({ form }: { form: UseFormReturn<SignupInput> }) {
  const emailCheck = useEmailCheck()
  const email = form.watch('email')
  const password = form.watch('password')
  const strength = pwStrength(password)
  const labelColor =
    strength === 0
      ? 'text-muted-foreground'
      : strength === 1
        ? 'text-destructive'
        : strength === 2
          ? 'text-[#b07a00]'
          : 'text-success'
  const segColor = (i: number) => {
    if (i >= strength) return 'bg-border'
    return strength === 1 ? 'bg-destructive' : strength === 2 ? 'bg-warning' : 'bg-success'
  }

  return (
    <div>
      <h2 className="text-[21px] font-extrabold leading-snug tracking-tight text-foreground">
        로그인에 사용할
        <br />
        계정을 만들어 주세요
      </h2>
      <p className="mb-7 mt-2 text-sm leading-relaxed text-muted-foreground">
        이메일과 비밀번호로 로그인하게 됩니다.
      </p>

      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem className="mb-4">
            <FormLabel>
              이메일<span aria-hidden="true" className="text-primary">*</span>
            </FormLabel>
            <div className="relative">
              <FormControl>
                <Input
                  type="email"
                  placeholder="example@magampick.com"
                  className="pr-[104px]"
                  {...field}
                />
              </FormControl>
              <button
                type="button"
                disabled={!email || emailCheck.isPending}
                onClick={() => emailCheck.mutate(email)}
                className="absolute right-1.5 top-1/2 h-11 -translate-y-1/2 rounded-lg bg-secondary px-3.5 text-[13px] font-bold text-secondary-foreground disabled:opacity-50"
              >
                중복확인
              </button>
            </div>
            {emailCheck.isSuccess ? (
              <p className="mt-1.5 text-xs font-medium text-success">사용 가능한 이메일이에요.</p>
            ) : emailCheck.error ? (
              <p className="mt-1.5 text-xs text-destructive">
                {(emailCheck.error as Error).message}
              </p>
            ) : (
              <p className="mt-1.5 text-xs text-muted-foreground">로그인 아이디로 사용됩니다.</p>
            )}
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="password"
        render={({ field }) => (
          <FormItem className="mb-4">
            <FormLabel>
              비밀번호<span aria-hidden="true" className="text-primary">*</span>
            </FormLabel>
            <FormControl>
              <Input type="password" placeholder="비밀번호 입력" {...field} />
            </FormControl>
            <div className="mt-2 flex gap-1">
              {[0, 1, 2].map((i) => (
                <span key={i} className={cn('h-1 flex-1 rounded-sm transition', segColor(i))} />
              ))}
            </div>
            <p className={cn('mt-1.5 text-[11.5px] font-bold', labelColor)}>
              {strength === 0
                ? '8자 이상, 영문·숫자·특수문자 포함'
                : `비밀번호 강도: ${['', '약함', '보통', '강함'][strength]}`}
            </p>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="passwordConfirm"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              비밀번호 확인<span aria-hidden="true" className="text-primary">*</span>
            </FormLabel>
            <FormControl>
              <Input type="password" placeholder="비밀번호 다시 입력" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
