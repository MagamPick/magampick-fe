import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form'
import { Input } from '@/shared/components/ui/input'
import { Button } from '@/shared/components/ui/button'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { cn } from '@/shared/lib/utils'
import { DateField } from './DateField'
import { makeEventFormSchema, type EventFormValues } from '../lib/eventFormSchema'
import type { CouponDiscountType, EventMutationPayload } from '../types'

export interface EventFormProps {
  mode: 'create' | 'edit'
  /** 오늘 "yyyy-MM-dd" — 생성 시 미래날짜 검증·Calendar 비활성 기준 */
  today: string
  defaultValues: EventFormValues
  /** 수정 시 발급 수 — >0 이면 소급 안내 노출 */
  issuedCount?: number
  isPending: boolean
  serverError?: string | null
  submitLabel: string
  onSubmit: (payload: EventMutationPayload) => void
  onCancel: () => void
}

const DISCOUNT_OPTIONS: { value: CouponDiscountType; label: string }[] = [
  { value: 'RATE', label: '정률 (%)' },
  { value: 'AMOUNT', label: '정액 (원)' },
]

/** 이벤트 생성/수정 공용 폼 (rhf + zodResolver + shadcn Form). 모드별 스키마는 makeEventFormSchema. */
export function EventForm({
  mode,
  today,
  defaultValues,
  issuedCount = 0,
  isPending,
  serverError,
  submitLabel,
  onSubmit,
  onCancel,
}: EventFormProps) {
  const form = useForm<EventFormValues>({
    resolver: zodResolver(makeEventFormSchema({ requireFutureDates: mode === 'create', today })),
    mode: 'onChange',
    defaultValues,
  })

  const discountType = form.watch('discountType')
  const unlimited = form.watch('unlimited')

  const handleValid = (v: EventFormValues) => {
    onSubmit({
      label: v.label.trim(),
      discountType: v.discountType,
      value: Number(v.value),
      minOrder: Number(v.minOrder),
      validUntil: v.validUntil,
      issueLimit: v.unlimited ? null : Number(v.issueLimit),
      displayStartAt: v.displayStartAt,
      displayEndAt: v.displayEndAt,
    })
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleValid)}
        noValidate
        className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto px-5 pb-5 pt-1"
      >
        {/* 라벨 */}
        <FormField
          control={form.control}
          name="label"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                라벨<span className="text-primary"> *</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="예) 여름 마감 할인 쿠폰" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 할인 종류 — 세그먼트 */}
        <FormField
          control={form.control}
          name="discountType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                할인 종류<span className="text-primary"> *</span>
              </FormLabel>
              <div className="grid grid-cols-2 gap-2">
                {DISCOUNT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    aria-pressed={field.value === opt.value}
                    onClick={() => field.onChange(opt.value)}
                    className={cn(
                      'h-11 rounded-[10px] border-[1.5px] text-sm font-semibold transition',
                      field.value === opt.value
                        ? 'border-primary bg-secondary text-secondary-foreground'
                        : 'border-input text-muted-foreground hover:border-muted-foreground/40',
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </FormItem>
          )}
        />

        {/* 할인 값 — discountType 의존 접미사 */}
        <FormField
          control={form.control}
          name="value"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {discountType === 'RATE' ? '할인율' : '할인 금액'}
                <span className="text-primary"> *</span>
              </FormLabel>
              <div className="relative">
                <FormControl>
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder={discountType === 'RATE' ? '1 ~ 100' : '예) 2000'}
                    className="pr-9"
                    {...field}
                  />
                </FormControl>
                <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                  {discountType === 'RATE' ? '%' : '원'}
                </span>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 최소 주문 금액 */}
        <FormField
          control={form.control}
          name="minOrder"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                최소 주문 금액<span className="text-primary"> *</span>
              </FormLabel>
              <div className="relative">
                <FormControl>
                  <Input type="text" inputMode="numeric" placeholder="0" className="pr-9" {...field} />
                </FormControl>
                <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                  원
                </span>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 발급 수량 + 무제한 */}
        <FormField
          control={form.control}
          name="issueLimit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                발급 수량<span className="text-primary"> *</span>
              </FormLabel>
              <div className="relative">
                <FormControl>
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="예) 100"
                    className="pr-9"
                    disabled={unlimited}
                    {...field}
                  />
                </FormControl>
                <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                  개
                </span>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="unlimited"
          render={({ field }) => (
            <label className="-mt-2 flex w-fit cursor-pointer items-center gap-2 text-sm font-medium text-foreground">
              <Checkbox
                checked={field.value}
                onCheckedChange={(c) => field.onChange(c === true)}
              />
              무제한 발급
            </label>
          )}
        />

        {/* 날짜 3개 */}
        <FormField
          control={form.control}
          name="displayStartAt"
          render={({ field, fieldState }) => (
            <FormItem>
              <span className="text-[13px] font-semibold text-foreground">
                노출 시작일<span className="text-primary"> *</span>
              </span>
              <DateField
                value={field.value}
                onChange={field.onChange}
                ariaLabel="노출 시작일"
                disabledBefore={mode === 'create' ? today : undefined}
                invalid={!!fieldState.error}
              />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="displayEndAt"
          render={({ field, fieldState }) => (
            <FormItem>
              <span className="text-[13px] font-semibold text-foreground">
                노출 종료일<span className="text-primary"> *</span>
              </span>
              <DateField
                value={field.value}
                onChange={field.onChange}
                ariaLabel="노출 종료일"
                disabledBefore={mode === 'create' ? today : undefined}
                invalid={!!fieldState.error}
              />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="validUntil"
          render={({ field, fieldState }) => (
            <FormItem>
              <span className="text-[13px] font-semibold text-foreground">
                쿠폰 만료일<span className="text-primary"> *</span>
              </span>
              <DateField
                value={field.value}
                onChange={field.onChange}
                ariaLabel="쿠폰 만료일"
                disabledBefore={mode === 'create' ? today : undefined}
                invalid={!!fieldState.error}
              />
              <FormMessage />
            </FormItem>
          )}
        />

        {mode === 'edit' && issuedCount > 0 && (
          <p className="rounded-lg bg-secondary px-3 py-2.5 text-[13px] leading-relaxed text-secondary-foreground">
            이미 발급된 쿠폰에는 적용되지 않고, 이후 발급분부터 반영됩니다.
          </p>
        )}

        {serverError && (
          <p role="alert" className="text-sm font-medium text-destructive">
            {serverError}
          </p>
        )}

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
            취소
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? '저장 중…' : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  )
}
