import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/shared/components/ui/sheet'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/shared/components/ui/form'
import { Textarea } from '@/shared/components/ui/textarea'
import { ApiError } from '@/shared/lib/apiError'
import { useReplyToReview } from '../hooks/useReplyToReview'
import { replyFormSchema, REPLY_CONTENT_MAX } from '../types'
import type { ReplyFormValues, SellerReview } from '../types'

interface Props {
  /** 답글 대상 리뷰 — null 이면 시트 닫힘 */
  review: SellerReview | null
  onOpenChange: (open: boolean) => void
}

/**
 * 리뷰 답글 작성 바텀시트 (프로토타입 50-reviews 답글 시트).
 * 리뷰당 답글 1개 — 등록 성공 시 목록·요약 무효화 후 닫힘. 중복 답글은 API 가 거부.
 */
export function ReviewReplySheet({ review, onOpenChange }: Props) {
  const reply = useReplyToReview()
  const form = useForm<ReplyFormValues>({
    resolver: zodResolver(replyFormSchema),
    mode: 'onChange',
    defaultValues: { content: '' },
  })

  // 새 리뷰로 시트가 열릴 때마다 입력 초기화
  useEffect(() => {
    if (review) form.reset({ content: '' })
  }, [review, form])

  const serverError =
    reply.error instanceof ApiError
      ? reply.error.message
      : reply.error
        ? '답글 등록 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요.'
        : null

  const onSubmit = (values: ReplyFormValues) => {
    if (!review) return
    reply.mutate(
      { reviewId: review.id, content: values.content },
      { onSuccess: () => onOpenChange(false) },
    )
  }

  return (
    <Sheet open={review !== null} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-[22px] px-5 pb-6">
        <SheetHeader className="px-0">
          <SheetTitle>답글 작성</SheetTitle>
        </SheetHeader>

        {review && (
          <p className="mb-3 line-clamp-2 rounded-[10px] bg-background px-3 py-2 text-[12.5px] text-muted-foreground">
            {review.authorNickname} · {review.content}
          </p>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      {...field}
                      maxLength={REPLY_CONTENT_MAX}
                      autoFocus
                      placeholder="고객님께 남길 답글을 입력하세요"
                      className="min-h-[100px] text-sm"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {serverError && (
              <p role="alert" className="mt-3 text-[13px] font-medium text-destructive">
                {serverError}
              </p>
            )}

            <button
              type="submit"
              disabled={!form.formState.isValid || reply.isPending}
              className="mt-5 h-[54px] w-full rounded-xl bg-primary text-base font-bold tracking-[-0.3px] text-white transition active:scale-[0.98] disabled:bg-[#f0d9ce] disabled:active:scale-100"
            >
              {reply.isPending ? '등록 중…' : '답글 등록'}
            </button>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
