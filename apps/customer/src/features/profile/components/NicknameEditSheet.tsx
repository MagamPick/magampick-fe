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
import { useUpdateNickname } from '../hooks/useUpdateNickname'
import { nicknameFormSchema, type NicknameFormValues } from '../types'

interface NicknameEditSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** 현재 닉네임 — 시트 열릴 때 입력 초기값 */
  currentNickname: string
}

/**
 * 닉네임 수정 바텀시트 (프로토타입 99-edit-profile-sheets 의 단순 1-필드 편집).
 * 노션 "소비자 프로필 관리": 닉네임 2~12자, 중복 허용. 저장 → 즉시 반영(프로필 쿼리 무효화) → 닫힘.
 */
export function NicknameEditSheet({ open, onOpenChange, currentNickname }: NicknameEditSheetProps) {
  const update = useUpdateNickname()
  const form = useForm<NicknameFormValues>({
    resolver: zodResolver(nicknameFormSchema),
    mode: 'onChange',
    defaultValues: { nickname: currentNickname },
  })

  // 시트가 열릴 때마다 현재 닉네임으로 리셋 + 유효성 즉시 계산(저장 버튼 상태 반영)
  useEffect(() => {
    if (open) {
      form.reset({ nickname: currentNickname })
      void form.trigger('nickname')
    }
  }, [open, currentNickname, form])

  const serverError =
    update.error instanceof ApiError
      ? update.error.message
      : update.error
        ? '저장 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.'
        : null

  const onSubmit = (values: NicknameFormValues) => {
    update.mutate(values.nickname, { onSuccess: () => onOpenChange(false) })
  }

  const saveDisabled = !form.formState.isValid || update.isPending

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-[22px] px-5 pb-6">
        <SheetHeader className="px-0">
          <SheetTitle>닉네임 수정</SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="nickname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">닉네임</FormLabel>
                  <FormControl>
                    <Input maxLength={12} placeholder="2~12자" autoFocus {...field} />
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
              className="mt-5 h-[54px] w-full rounded-xl bg-primary text-base font-bold tracking-[-0.3px] text-white transition active:scale-[0.98] disabled:bg-[#f0d9ce] disabled:active:scale-100"
            >
              {update.isPending ? '저장 중…' : '저장'}
            </button>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
