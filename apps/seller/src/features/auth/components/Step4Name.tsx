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
        대표자 실명을
        <br />
        입력해 주세요
      </h2>
      <p className="mb-7 mt-2 text-sm leading-relaxed text-muted-foreground">
        사업자등록증에 기재된 대표자명과 동일하게 입력해 주세요.
      </p>

      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              대표자명<span aria-hidden="true" className="text-primary">*</span>
            </FormLabel>
            <FormControl>
              <Input maxLength={20} placeholder="실명을 입력하세요" {...field} />
            </FormControl>
            <p className="mt-1.5 text-xs text-muted-foreground">
              정산·세금계산서 발행 시 사용됩니다.
            </p>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
