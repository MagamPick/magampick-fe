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
import { Textarea } from '@/shared/components/ui/textarea'
import { ApiError } from '@/shared/lib/apiError'
import {
  INQUIRY_CATEGORY_LABEL,
  inquiryCategorySchema,
  inquiryInputSchema,
  type Inquiry,
  type InquiryInput,
} from '../types'
import { useSubmitInquiry } from '../hooks/useSubmitInquiry'

const CATEGORY_OPTIONS = inquiryCategorySchema.options

/**
 * 1:1 문의 작성 폼 (프로토타입 63-support `sp-contact`).
 * 카테고리(고정 목록) + 제목(2자↑) + 내용(10자↑) 셋 다 충족해야 제출 활성.
 */
export function InquiryForm({ onSubmitted }: { onSubmitted?: (inquiry: Inquiry) => void }) {
  const submit = useSubmitInquiry()
  const form = useForm<InquiryInput>({
    resolver: zodResolver(inquiryInputSchema),
    mode: 'onChange',
    defaultValues: { category: CATEGORY_OPTIONS[0], title: '', content: '' },
  })

  const content = form.watch('content')

  const onSubmit = (values: InquiryInput) => {
    submit.mutate(values, {
      onSuccess: (inquiry) => {
        form.reset()
        onSubmitted?.(inquiry)
      },
    })
  }

  const serverError =
    submit.error instanceof ApiError
      ? submit.error.message
      : submit.error
        ? '문의 접수에 실패했어요. 잠시 후 다시 시도해주세요.'
        : null

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-[18px] px-5 py-[18px]"
      >
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>문의 카테고리</FormLabel>
              <FormControl>
                <select
                  {...field}
                  className="h-[50px] w-full rounded-[10px] border-[1.5px] border-input bg-card px-3.5 text-[15px] text-foreground outline-none focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-secondary"
                >
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {INQUIRY_CATEGORY_LABEL[c]}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>제목</FormLabel>
              <FormControl>
                <Input placeholder="문의 제목" maxLength={40} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>내용</FormLabel>
              <FormControl>
                <Textarea
                  rows={6}
                  placeholder="문의 내용을 자세히 적어주세요."
                  maxLength={1000}
                  {...field}
                />
              </FormControl>
              <p className="text-right text-[12px] text-muted-foreground">
                {content.length} / 1,000자
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        {serverError && (
          <p role="alert" className="text-[13px] font-medium text-destructive">
            {serverError}
          </p>
        )}

        <button
          type="submit"
          disabled={!form.formState.isValid || submit.isPending}
          className="h-[54px] w-full rounded-xl bg-primary text-base font-bold text-white disabled:bg-primary-disabled"
        >
          {submit.isPending ? '보내는 중...' : '문의 보내기'}
        </button>
      </form>
    </Form>
  )
}
