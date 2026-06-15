import type { UseFormReturn } from 'react-hook-form'
import { Check } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import type { SignupInput, SignupTerm } from '../types'

interface Props {
  form: UseFormReturn<SignupInput>
  terms: SignupTerm[]
  isLoading?: boolean
  errorMessage?: string
  onOpenTerms: (id: number) => void
}

export function Step1Terms({ form, terms, isLoading = false, errorMessage, onOpenTerms }: Props) {
  const agreed = form.watch('agreedTermIds')
  const allChecked = terms.length > 0 && terms.every((t) => agreed.includes(t.id))

  const setAgreed = (ids: number[]) =>
    form.setValue('agreedTermIds', ids, { shouldValidate: true, shouldDirty: true })
  const toggle = (id: number) =>
    setAgreed(agreed.includes(id) ? agreed.filter((x) => x !== id) : [...agreed, id])
  const toggleAll = () => setAgreed(allChecked ? [] : terms.map((t) => t.id))

  return (
    <div>
      <h2 className="text-[21px] font-extrabold leading-snug tracking-tight text-foreground">
        서비스 이용약관에
        <br />
        동의해 주세요
      </h2>
      <p className="mb-7 mt-2 text-sm leading-relaxed text-muted-foreground">
        마감픽 사장 서비스 이용을 위한 약관입니다.
      </p>

      {isLoading && (
        <div className="rounded-xl bg-background p-4 text-sm font-semibold text-muted-foreground">
          약관을 불러오는 중입니다
        </div>
      )}

      {errorMessage && (
        <div className="rounded-xl bg-destructive/10 p-4 text-sm font-semibold text-destructive">
          {errorMessage}
        </div>
      )}

      {/* 전체동의 — 연주황 카드 (chk--sq) */}
      <button
        type="button"
        onClick={toggleAll}
        disabled={terms.length === 0}
        className="mb-2 flex w-full items-center gap-3 rounded-xl bg-secondary p-4 text-left"
      >
        <span
          className={cn(
            'flex size-6 shrink-0 items-center justify-center rounded-[7px] border-[1.5px]',
            allChecked ? 'border-primary bg-primary text-white' : 'border-border bg-card',
          )}
        >
          {allChecked && <Check className="size-3.5" strokeWidth={3} />}
        </span>
        <span className="font-bold text-foreground">약관에 모두 동의합니다</span>
      </button>

      {/* 개별 약관 — 원형 체크 (chk) */}
      <ul className="px-1">
        {terms.map((term) => {
          const on = agreed.includes(term.id)
          return (
            <li key={term.id} className="flex items-center gap-3 py-[18px]">
              <button
                type="button"
                role="checkbox"
                aria-checked={on}
                aria-label={term.title}
                onClick={() => toggle(term.id)}
                className={cn(
                  'flex size-6 shrink-0 items-center justify-center rounded-full border-[1.5px] transition',
                  on
                    ? 'border-primary bg-primary text-white'
                    : 'border-border bg-card text-transparent',
                )}
              >
                <Check className="size-3.5" strokeWidth={3} />
              </button>
              <span className="flex-1 text-sm text-foreground">
                {term.title}{' '}
                <span
                  className={cn(
                    'text-[13px] font-bold',
                    term.required ? 'text-primary' : 'text-muted-foreground',
                  )}
                >
                  ({term.required ? '필수' : '선택'})
                </span>
              </span>
              <button
                type="button"
                onClick={() => onOpenTerms(term.id)}
                className="px-1 text-xs font-semibold text-placeholder underline"
              >
                보기
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
