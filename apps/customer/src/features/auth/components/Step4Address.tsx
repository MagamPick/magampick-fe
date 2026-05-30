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
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/shared/components/ui/sheet'
import type { SignupInput } from '../types'

// Mock 주소 — 의도적 최소 구현. 프로토타입 mock 시트의 검색바·우편번호 UI 는 생략했다.
// 실연동 시 카카오(Daum) 우편번호 위젯이 이 검색 시트를 통째 대체하므로(throwaway), 지금은
// 정적 리스트만. 실연동은 주소지 관리 도메인 연동 PR 에서. 프로토타입 SAMPLE_ADDRESSES 참조.
const SAMPLE_ADDRESSES = [
  '서울 마포구 와우산로 94',
  '서울 마포구 서교동 357-2',
  '서울 마포구 양화로 156',
  '서울 마포구 동교로 226',
  '서울 마포구 잔다리로 30',
  '서울 마포구 합정동 411',
  '서울 마포구 망원로 51',
  '서울 마포구 월드컵북로 396',
]

export function Step4Address({ form }: { form: UseFormReturn<SignupInput> }) {
  const [open, setOpen] = useState(false)
  const select = (addr: string) => {
    form.setValue('address', addr, { shouldValidate: true })
    setOpen(false)
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
                <Input placeholder="주소를 검색하세요" readOnly className="pr-[104px]" {...field} />
              </FormControl>
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="absolute right-1.5 top-1/2 h-11 -translate-y-1/2 rounded-lg bg-secondary px-3.5 text-[13px] font-bold text-secondary-foreground"
              >
                주소 검색
              </button>
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              도로명·지번 모두 검색 가능해요. 상세주소는 가입 후 마이 &gt; 주소 관리에서 추가할 수
              있어요.
            </p>
            <FormMessage />
          </FormItem>
        )}
      />

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="max-h-[70vh] rounded-t-[22px]">
          <SheetHeader>
            <SheetTitle>주소 검색</SheetTitle>
          </SheetHeader>
          <ul className="overflow-y-auto px-5 pb-6">
            {SAMPLE_ADDRESSES.map((addr) => (
              <li key={addr}>
                <button
                  type="button"
                  onClick={() => select(addr)}
                  className="w-full border-b border-border py-3.5 text-left text-sm font-bold text-foreground last:border-b-0"
                >
                  {addr}
                </button>
              </li>
            ))}
          </ul>
        </SheetContent>
      </Sheet>
    </div>
  )
}
