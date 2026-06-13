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
import { Button } from '@/shared/components/ui/button'
import { Switch } from '@/shared/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import {
  announcementFormSchema,
  BODY_MAX,
  type AnnouncementFormValues,
} from '../lib/announcementFormSchema'
import { NOTICE_TAG_LABEL, noticeTagSchema, type AnnouncementMutationPayload } from '../types'

export interface AnnouncementFormProps {
  defaultValues: AnnouncementFormValues
  isPending: boolean
  serverError?: string | null
  submitLabel: string
  onSubmit: (payload: AnnouncementMutationPayload) => void
  onCancel: () => void
}

const TAG_OPTIONS = noticeTagSchema.options.map((value) => ({
  value,
  label: NOTICE_TAG_LABEL[value],
}))

/** 공지 생성/수정 공용 폼 (rhf + zodResolver + shadcn Form). 즉시 발행/수정. */
export function AnnouncementForm({
  defaultValues,
  isPending,
  serverError,
  submitLabel,
  onSubmit,
  onCancel,
}: AnnouncementFormProps) {
  const form = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementFormSchema),
    mode: 'onChange',
    defaultValues,
  })

  const bodyLength = form.watch('body').length

  const handleValid = (v: AnnouncementFormValues) => {
    onSubmit({
      tag: v.tag,
      pinned: v.pinned,
      title: v.title.trim(),
      body: v.body.trim(),
    })
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleValid)}
        noValidate
        className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto px-5 pb-5 pt-1"
      >
        {/* 태그 */}
        <FormField
          control={form.control}
          name="tag"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                태그<span className="text-primary"> *</span>
              </FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="태그 선택" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {TAG_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 상단 고정 */}
        <FormField
          control={form.control}
          name="pinned"
          render={({ field }) => (
            <div className="flex items-center justify-between rounded-lg border border-input px-3.5 py-3">
              <div>
                <p className="text-sm font-semibold text-foreground">상단 고정</p>
                <p className="mt-0.5 text-[13px] text-muted-foreground">
                  목록 최상단에 우선 노출됩니다.
                </p>
              </div>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
                aria-label="상단 고정"
              />
            </div>
          )}
        />

        {/* 제목 */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                제목<span className="text-primary"> *</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="예) 서비스 점검 안내" maxLength={200} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 본문 */}
        <FormField
          control={form.control}
          name="body"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                내용<span className="text-primary"> *</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="공지 내용을 입력해 주세요"
                  className="min-h-40"
                  maxLength={BODY_MAX}
                  {...field}
                />
              </FormControl>
              <div className="flex items-center justify-between">
                <FormMessage />
                <span className="ml-auto text-[12px] text-muted-foreground">
                  {bodyLength}/{BODY_MAX}
                </span>
              </div>
            </FormItem>
          )}
        />

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
