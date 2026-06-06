import { useState } from 'react'
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
import { searchRoadAddress } from '../lib/addressSearch'

export function Step4Address({ form }: { form: UseFormReturn<SignupInput> }) {
  const [pending, setPending] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const search = async () => {
    setPending(true)
    setErrorMessage(null)
    try {
      const address = await searchRoadAddress()
      form.setValue('address', address, { shouldValidate: true, shouldDirty: true })
      form.clearErrors('address')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '주소를 선택하지 못했어요')
    } finally {
      setPending(false)
    }
  }

  return (
    <div>
      <h2 className="text-[21px] font-extrabold leading-snug tracking-tight text-foreground">
        기본 주소를
        <br />
        등록해 주세요
      </h2>
      <p className="mb-7 mt-2 text-sm leading-relaxed text-muted-foreground">
        내 주변 마감 할인을 찾는 기준이 돼요.
      </p>

      <FormField
        control={form.control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              기본 주소<span aria-hidden="true" className="text-primary">*</span>
            </FormLabel>
            <div className="relative">
              <FormControl>
                <Input
                  placeholder="주소를 검색하세요"
                  readOnly
                  className="pr-[104px]"
                  name={field.name}
                  ref={field.ref}
                  onBlur={field.onBlur}
                  value={field.value?.roadAddress ?? ''}
                />
              </FormControl>
              <button
                type="button"
                onClick={search}
                disabled={pending}
                className="absolute right-1.5 top-1/2 h-11 -translate-y-1/2 rounded-lg bg-secondary px-3.5 text-[13px] font-bold text-secondary-foreground"
              >
                {pending ? '검색 중' : '주소 검색'}
              </button>
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              도로명·지번 모두 검색 가능해요. 상세주소는 가입 후 마이 &gt; 주소 관리에서 추가할 수
              있어요.
            </p>
            {errorMessage && <p className="mt-1.5 text-xs text-destructive">{errorMessage}</p>}
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
