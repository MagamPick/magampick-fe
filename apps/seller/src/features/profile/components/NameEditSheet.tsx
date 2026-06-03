import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/shared/components/ui/sheet'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/shared/components/ui/form'
import { Input } from '@/shared/components/ui/input'
import { ApiError } from '@/shared/lib/apiError'
import { useUpdateName } from '../hooks/useUpdateName'
import { nameFormSchema, type NameFormValues } from '../types'

interface NameEditSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** 현재 실명 — 시트 열릴 때 입력 초기값 */
  currentName: string
}

/**
 * 실명 수정 바텀시트 (프로토타입 53-profile-edit 의 이름 필드).
 * 노션 "사장 프로필 관리": 실명 2~20자, 가명·별명 금지. 저장 → 즉시 반영(프로필 쿼리 무효화) → 닫힘.
 */
export function NameEditSheet({ open, onOpenChange, currentName }: NameEditSheetProps) {
  const update = useUpdateName()
  const form = useForm<NameFormValues>({
    resolver: zodResolver(nameFormSchema),
    mode: 'onChange',
    defaultValues: { name: currentName },
  })

  // 시트가 열릴 때마다 현재 실명으로 리셋 + 유효성 즉시 계산(저장 버튼 상태 반영)
  useEffect(() => {
    if (open) {
      form.reset({ name: currentName })
      void form.trigger('name')
    }
  }, [open, currentName, form])

  const serverError =
    update.error instanceof ApiError
      ? update.error.message
      : update.error
        ? '저장 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.'
        : null

  const onSubmit = (values: NameFormValues) => {
    update.mutate(values.name, { onSuccess: () => onOpenChange(false) })
  }

  const saveDisabled = !form.formState.isValid || update.isPending

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-[22px] px-5 pb-6">
        <SheetHeader className="px-0">
          <SheetTitle>실명 수정</SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">실명</FormLabel>
                  <FormControl>
                    <Input maxLength={20} placeholder="2~20자" autoFocus {...field} />
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
              disabled={saveDisabled}
              className="mt-5 h-[54px] w-full rounded-xl bg-primary text-base font-bold tracking-[-0.3px] text-white transition active:scale-[0.98] disabled:bg-primary-disabled disabled:active:scale-100"
            >
              {update.isPending ? '저장 중…' : '저장'}
            </button>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
