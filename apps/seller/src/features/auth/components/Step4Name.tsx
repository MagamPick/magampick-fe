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

export function Step4Name({ form }: { form: UseFormReturn<SignupInput> }) {
  return (
    <div>
      <h2 className="text-[21px] font-extrabold leading-snug tracking-tight text-foreground">
        사장님 성함을
        <br />
        입력해 주세요
      </h2>
      <p className="mb-7 mt-2 text-sm leading-relaxed text-muted-foreground">
        계정에 등록되는 사장님 실명이에요.
      </p>

      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              이름<span aria-hidden="true" className="text-primary">*</span>
            </FormLabel>
            <FormControl>
              <Input maxLength={20} placeholder="실명을 입력하세요" {...field} />
            </FormControl>
            <p className="mt-1.5 text-xs text-muted-foreground">
              정산·세금계산서와 매장 운영자 표시에 사용돼요.
            </p>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
