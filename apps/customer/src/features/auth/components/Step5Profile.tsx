import type { UseFormReturn } from 'react-hook-form'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/shared/components/ui/form'
import { Input } from '@/shared/components/ui/input'
import type { SignupInput } from '../types'

export function Step5Profile({ form }: { form: UseFormReturn<SignupInput> }) {
  return (
    <div>
      <h2 className="text-[21px] font-extrabold leading-snug tracking-tight text-foreground">
        프로필을
        <br />
        완성해 주세요
      </h2>
      <p className="mb-7 mt-2 text-sm leading-relaxed text-muted-foreground">
        매장과 다른 손님에게 보여질 정보예요.
      </p>

      <FormField
        control={form.control}
        name="nickname"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              닉네임<span aria-hidden="true" className="text-primary">*</span>
            </FormLabel>
            <FormControl>
              <Input maxLength={12} placeholder="2~12자 닉네임" {...field} />
            </FormControl>
            <p className="mt-1.5 text-xs text-muted-foreground">매장 리뷰 등에 표시됩니다.</p>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
