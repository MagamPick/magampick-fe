import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/shared/components/ui/form'
import { Textarea } from '@/shared/components/ui/textarea'
import { RatingInput } from './RatingInput'
import { QuickTagPicker } from './QuickTagPicker'
import { ReviewPhotoInput } from './ReviewPhotoInput'
import { reviewFormSchema, REVIEW_CONTENT_MAX } from '../types'
import type { OrderItem, ReviewFormValues } from '../types'

/** 작성 화면 각 섹션 박스 (프로토타입 rw-section — 흰 카드 + border + radius 14) */
const SECTION = 'mt-3.5 rounded-[14px] border border-border bg-card p-4'

interface Props {
  /** 리뷰 대상 매장 — 헤더 표시 */
  storeEmoji: string
  storeName: string
  /** 주문 상품들 — 어떤 상품에 대한 리뷰인지 표시 */
  items: OrderItem[]
  /** 수정 시 기존값(작성 시 생략 → 빈 폼) */
  defaultValues?: ReviewFormValues
  onSubmit: (values: ReviewFormValues) => void
  isPending: boolean
  serverError?: string | null
  submitLabel: string
}

/**
 * 리뷰 작성/수정 폼 (노션: 리뷰 작성). 입력 순서 별점→빠른평가→후기→사진.
 * 별점만 필수(미선택 시 제출 비활성), 나머지 선택. 각 섹션은 흰 박스. 프로토타입 52-review-write.
 */
export function ReviewForm({
  storeEmoji,
  storeName,
  items,
  defaultValues,
  onSubmit,
  isPending,
  serverError,
  submitLabel,
}: Props) {
  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    mode: 'onChange',
    defaultValues: defaultValues ?? { rating: 0, content: '', tags: [], photos: [] },
  })

  const contentLength = form.watch('content').length

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="flex flex-1 flex-col">
        <div className="flex-1 px-5 pb-6">
          {/* 매장 + 주문 상품 */}
          <div className={`${SECTION} mt-4`}>
            <div className="flex items-center gap-[11px]">
              <span className="flex size-[52px] items-center justify-center rounded-[11px] bg-cream text-[22px]">
                {storeEmoji}
              </span>
              <p className="min-w-0 flex-1 truncate text-[14px] font-extrabold">{storeName}</p>
            </div>
            {items.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {items.map((item) => (
                  <span
                    key={item.productId}
                    className="rounded-md bg-background px-2.5 py-1 text-[12px] font-bold text-foreground"
                  >
                    {item.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 별점 (필수) */}
          <FormField
            control={form.control}
            name="rating"
            render={({ field }) => (
              <FormItem className={SECTION}>
                <FormControl>
                  <RatingInput value={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage className="text-center" />
              </FormItem>
            )}
          />

          {/* 빠른 평가 (선택) */}
          <section className={SECTION}>
            <p className="mb-2.5 text-[16px] font-bold">
              빠른 평가{' '}
              <span className="text-[13px] font-semibold text-muted-foreground">(선택)</span>
            </p>
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <QuickTagPicker value={field.value} onChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </section>

          {/* 자세한 후기 (선택) */}
          <section className={SECTION}>
            <p className="mb-2.5 text-[16px] font-bold">
              자세한 후기{' '}
              <span className="text-[13px] font-semibold text-muted-foreground">(선택)</span>
            </p>
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      {...field}
                      maxLength={REVIEW_CONTENT_MAX}
                      placeholder="다른 분들께 도움이 되는 후기를 남겨 주세요"
                      className="min-h-[120px] rounded-[12px] text-sm leading-relaxed"
                    />
                  </FormControl>
                  <div className="mt-1.5 text-right text-[11.5px] font-semibold text-placeholder">
                    <b className="text-primary">{contentLength}</b> / {REVIEW_CONTENT_MAX}자
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </section>

          {/* 사진 첨부 (선택) */}
          <section className={SECTION}>
            <p className="mb-2.5 text-[16px] font-bold">
              사진 첨부{' '}
              <span className="text-[13px] font-semibold text-muted-foreground">
                (선택 · 최대 3장)
              </span>
            </p>
            <FormField
              control={form.control}
              name="photos"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <ReviewPhotoInput value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </section>

          {serverError && (
            <p role="alert" className="mt-4 text-[13px] font-medium text-destructive">
              {serverError}
            </p>
          )}
        </div>

        {/* CTA */}
        <div className="border-t border-border bg-card px-5 py-3">
          <button
            type="submit"
            disabled={!form.formState.isValid || isPending}
            className="h-[54px] w-full rounded-xl bg-primary text-base font-bold tracking-[-0.3px] text-white transition active:scale-[0.98] disabled:bg-primary-disabled disabled:active:scale-100"
          >
            {isPending ? '저장 중…' : submitLabel}
          </button>
        </div>
      </form>
    </Form>
  )
}
