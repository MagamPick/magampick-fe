import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form'
import { Input } from '@/shared/components/ui/input'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/shared/components/ui/sheet'
import { cn } from '@/shared/lib/utils'
import { ApiError } from '@/shared/lib/apiError'
import { ROUTES } from '@/shared/lib/routes'
import { SAMPLE_ADDRESSES } from '../lib/sampleAddresses'
import { useUpdateStore } from '../hooks/useUpdateStore'
import { storeEditSchema } from '../types'
import type { StoreDetail, StoreEditInput } from '../types'

/**
 * 매장 정보 수정 폼 — 현재 정보 미리채움(detail) 후 5필드(매장명·주소·상세 주소·전화·대표 사진) 수정.
 * 저장(자동 승인·즉시 반영) → 매장 관리로 복귀. 사업자번호·대표자명·영업상태·영업시간은 비범위(수정 불가).
 * UI 골격은 등록 폼(StoreRegisterForm)에서 사업자 진위확인 블록만 뺀 부분집합.
 */
export function StoreEditForm({ detail }: { detail: StoreDetail }) {
  const navigate = useNavigate()
  const update = useUpdateStore()
  const [addrOpen, setAddrOpen] = useState(false)

  const form = useForm<StoreEditInput>({
    resolver: zodResolver(storeEditSchema),
    mode: 'onChange',
    defaultValues: {
      storeName: detail.storeName,
      storeAddress: detail.storeAddress,
      storeAddressDetail: detail.storeAddressDetail ?? '',
      storePhone: detail.storePhone,
      photoAdded: detail.photoAdded,
    },
  })

  const photoAdded = !!form.watch('photoAdded')
  const storeName = form.watch('storeName')
  const storeAddress = form.watch('storeAddress')
  const storePhone = form.watch('storePhone')
  // 필수 3필드(매장명·주소·전화)가 모두 채워졌을 때만 저장 가능 — storeEditSchema 필수와 동치
  const canSave =
    storeName.trim().length > 0 && storeAddress.trim().length > 0 && storePhone.trim().length > 0

  const togglePhoto = () =>
    form.setValue('photoAdded', !photoAdded, { shouldValidate: true, shouldDirty: true })

  const selectAddr = (addr: string) => {
    form.setValue('storeAddress', addr, { shouldValidate: true })
    setAddrOpen(false)
  }

  function onSubmit(values: StoreEditInput) {
    update.mutate(
      {
        storeId: detail.id,
        storeName: values.storeName,
        storeAddress: values.storeAddress,
        storeAddressDetail: values.storeAddressDetail?.trim() || undefined,
        storePhone: values.storePhone,
        photoAdded: values.photoAdded,
      },
      // 저장 즉시 반영(무효화는 훅) 후 매장 관리로 복귀
      { onSuccess: () => navigate(ROUTES.STORE_MANAGE) },
    )
  }

  const serverError =
    update.error instanceof ApiError
      ? update.error.message
      : update.error
        ? '저장 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요.'
        : null

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="flex flex-1 flex-col">
        <div className="flex-1 px-5 pb-6 pt-4">
          {/* 대표 사진 — mock 토글. 실 업로드/기존 삭제는 BE·연동 PR */}
          <button
            type="button"
            onClick={togglePhoto}
            className={cn(
              'mb-5 flex h-[168px] w-full flex-col items-center justify-center gap-2 rounded-[14px] border-[1.5px] transition',
              photoAdded
                ? 'border-solid border-primary bg-gradient-to-br from-[#fff0eb] to-[#ffd9c7] text-secondary-foreground'
                : 'border-dashed border-border bg-background text-muted-foreground',
            )}
          >
            <span className="text-[34px] leading-none">{photoAdded ? '🏪' : '📷'}</span>
            <span className="text-[13.5px] font-semibold">
              {photoAdded ? '대표 사진 등록 완료' : '대표 사진 등록'}
            </span>
            <span
              className={cn(
                'text-[11.5px]',
                photoAdded ? 'text-secondary-foreground' : 'text-[#bdbdbd]',
              )}
            >
              {photoAdded
                ? '탭하면 사진을 제거합니다 (데모)'
                : '매장 외관이 잘 보이는 사진을 권장해요'}
            </span>
          </button>

          <FormField
            control={form.control}
            name="storeName"
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormLabel>
                  매장명
                  <span aria-hidden="true" className="text-primary">
                    *
                  </span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="예) 마감픽 베이커리 신촌점" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="storeAddress"
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormLabel>
                  매장 주소
                  <span aria-hidden="true" className="text-primary">
                    *
                  </span>
                </FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      placeholder="주소를 검색하세요"
                      readOnly
                      className="pr-[104px]"
                      {...field}
                    />
                  </FormControl>
                  <button
                    type="button"
                    onClick={() => setAddrOpen(true)}
                    className="absolute right-1.5 top-1/2 h-11 -translate-y-1/2 rounded-lg bg-secondary px-3.5 text-[13px] font-bold text-secondary-foreground"
                  >
                    주소 검색
                  </button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="storeAddressDetail"
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormLabel>상세 주소</FormLabel>
                <FormControl>
                  <Input placeholder="동·층·호수 등" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="storePhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  매장 전화번호
                  <span aria-hidden="true" className="text-primary">
                    *
                  </span>
                </FormLabel>
                <FormControl>
                  <Input type="tel" inputMode="numeric" placeholder="02-0000-0000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {serverError && (
            <p role="alert" className="mt-4 text-[13px] font-medium text-destructive">
              {serverError}
            </p>
          )}
        </div>

        {/* CTA */}
        <div className="border-t border-border bg-card px-5 py-3">
          <button
            type="submit"
            disabled={!canSave || update.isPending}
            className="h-[54px] w-full rounded-xl bg-primary text-base font-bold tracking-[-0.3px] text-white transition active:scale-[0.98] disabled:bg-primary-disabled disabled:active:scale-100"
          >
            {update.isPending ? '저장 중…' : '저장'}
          </button>
        </div>

        <Sheet open={addrOpen} onOpenChange={setAddrOpen}>
          <SheetContent side="bottom" className="max-h-[70vh] rounded-t-[22px]">
            <SheetHeader>
              <SheetTitle>주소 검색</SheetTitle>
            </SheetHeader>
            <ul className="overflow-y-auto px-5 pb-6">
              {SAMPLE_ADDRESSES.map((addr) => (
                <li key={addr}>
                  <button
                    type="button"
                    onClick={() => selectAddr(addr)}
                    className="w-full border-b border-border py-3.5 text-left text-sm font-bold text-foreground last:border-b-0"
                  >
                    {addr}
                  </button>
                </li>
              ))}
            </ul>
          </SheetContent>
        </Sheet>
      </form>
    </Form>
  )
}
