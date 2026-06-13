import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form'
import { Textarea } from '@/shared/components/ui/textarea'
import { Button } from '@/shared/components/ui/button'
import { ApiError } from '@/shared/lib/apiError'
import { InquiryStatusBadge } from './InquiryStatusBadge'
import { useAnswerInquiry } from '../hooks/useAnswerInquiry'
import { answerInputSchema, type AnswerInput } from '../lib/answerSchema'
import { inquiryCategoryLabel } from '../lib/inquiryFormat'
import type { InquiryView } from '../types'

/**
 * 문의 답변 다이얼로그. inquiry !== null 이면 열림.
 * - pending: 답변 textarea + [답변 등록] → POST → 성공 시 같은 패널을 answered 뷰로 전환.
 * - answered: 기존 답변 read-only (입력 UI 없음 → 409 원천 차단).
 */
export function InquiryAnswerDialog({
  inquiry,
  onOpenChange,
}: {
  inquiry: InquiryView | null
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={inquiry !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        {inquiry && (
          <InquiryAnswerBody key={inquiry.id} inquiry={inquiry} onClose={() => onOpenChange(false)} />
        )}
      </DialogContent>
    </Dialog>
  )
}

function errorMessage(error: unknown): string | null {
  if (!error) return null
  if (error instanceof ApiError) return error.message
  return '답변 등록 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요.'
}

function InquiryAnswerBody({ inquiry, onClose }: { inquiry: InquiryView; onClose: () => void }) {
  const answer = useAnswerInquiry(inquiry.id)

  // 답변 성공 시 BE 가 돌려준 answered 뷰로 전환(목록 invalidate 는 훅 onSettled).
  const view = answer.data ?? inquiry
  const answered = view.status === 'answered' && view.answer ? view.answer : null

  const form = useForm<AnswerInput>({
    resolver: zodResolver(answerInputSchema),
    mode: 'onChange',
    defaultValues: { content: '' },
  })

  const handleValid = (values: AnswerInput) => {
    answer.mutate(values.content)
  }

  const serverError = errorMessage(answer.error)

  return (
    <>
      <DialogHeader>
        <div className="flex items-center gap-2">
          <InquiryStatusBadge status={view.status} />
          <span className="text-xs font-medium text-muted-foreground">
            {inquiryCategoryLabel(view.category)} · 접수일 {view.createdAt}
          </span>
        </div>
        <DialogTitle className="mt-1">{view.title}</DialogTitle>
      </DialogHeader>

      <div className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto px-5 pb-5">
        {/* 문의 내용 */}
        <section>
          <p className="text-[13px] font-semibold text-foreground">문의 내용</p>
          <p className="mt-1.5 whitespace-pre-wrap rounded-lg bg-muted/50 px-3.5 py-3 text-sm leading-relaxed text-foreground">
            {view.content}
          </p>
        </section>

        {answered ? (
          // ── 답변 완료 — 읽기 전용 ──
          <section>
            <p className="text-[13px] font-semibold text-foreground">
              답변 <span className="font-normal text-muted-foreground">· {answered.answeredAt}</span>
            </p>
            <p className="mt-1.5 whitespace-pre-wrap rounded-lg bg-secondary px-3.5 py-3 text-sm leading-relaxed text-secondary-foreground">
              {answered.content}
            </p>
            <div className="mt-4 flex justify-end">
              <Button type="button" variant="outline" onClick={onClose}>
                닫기
              </Button>
            </div>
          </section>
        ) : (
          // ── 답변 대기 — 입력 폼 ──
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleValid)} noValidate className="flex flex-col gap-3">
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>답변 작성</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={6}
                        placeholder="소비자에게 전달할 답변을 입력하세요. (최대 2000자)"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {serverError && (
                <p role="alert" className="text-sm font-medium text-destructive">
                  {serverError}
                </p>
              )}

              <div className="mt-1 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onClose} disabled={answer.isPending}>
                  취소
                </Button>
                <Button type="submit" disabled={answer.isPending}>
                  {answer.isPending ? '등록 중…' : '답변 등록'}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </div>
    </>
  )
}
