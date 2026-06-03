import type { UseFormReturn } from 'react-hook-form'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/shared/components/ui/form'
import { Input } from '@/shared/components/ui/input'
import type { PasswordResetInput } from '../types'

/**
 * 비밀번호 재설정 Step 3 — 새 비밀번호 입력 + 확인. 정책(8자·영문·숫자·특수)은 passwordSchema 공유.
 * 프로토타입 11-forgot forgot__reset 패턴(강도 게이지 없이 두 필드).
 */
export function PasswordResetNewPwStep({ form }: { form: UseFormReturn<PasswordResetInput> }) {
  return (
    <div>
      <h2 className="text-[21px] font-extrabold leading-snug tracking-tight text-foreground">
        새 비밀번호를
        <br />
        설정해 주세요
      </h2>
      <p className="mb-7 mt-2 text-sm leading-relaxed text-muted-foreground">
        8자 이상, 영문·숫자·특수문자를 포함해 주세요.
      </p>

      <FormField
        control={form.control}
        name="newPassword"
        render={({ field }) => (
          <FormItem className="mb-4">
            <FormLabel>
              새 비밀번호
              <span aria-hidden="true" className="text-primary">
                *
              </span>
            </FormLabel>
            <FormControl>
              <Input
                type="password"
                autoComplete="new-password"
                placeholder="새 비밀번호 입력"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="newPasswordConfirm"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              새 비밀번호 확인
              <span aria-hidden="true" className="text-primary">
                *
              </span>
            </FormLabel>
            <FormControl>
              <Input
                type="password"
                autoComplete="new-password"
                placeholder="새 비밀번호 다시 입력"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
