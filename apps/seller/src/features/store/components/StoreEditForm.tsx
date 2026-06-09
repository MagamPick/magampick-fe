import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
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
import { cn } from '@/shared/lib/utils'
import { ApiError } from '@/shared/lib/apiError'
import { ROUTES } from '@/shared/lib/routes'
import { searchStoreAddress } from '@/features/auth/lib/addressSearch'
import { useUpdateStore } from '../hooks/useUpdateStore'
import { storeEditSchema } from '../types'
import type { StoreDetail, StoreEditInput } from '../types'

/** 대표 사진 최대 용량(MB) */
const MAX_IMAGE_MB = 5

/**
 * 매장 정보 수정 폼 — 현재 정보 미리채움(detail) 후 5필드(매장명·주소·상세 주소·전화·대표 사진) 수정.
 * 저장(자동 승인·즉시 반영) → 매장 관리로 복귀. 사업자번호·대표자명·영업상태·영업시간은 비범위(수정 불가).
 *
 * 부분 업데이트 설계:
 * - 매장명·전화·상세주소: 항상 제출 (BE 멱등)
 * - 주소(road+코드들): Daum 재검색한 경우에만 PATCH 에 포함 (storeAddress !== null) → 미포함 시 지오코딩 재호출 없음
 * - 이미지: 새 File 선택한 경우에만 image 파트 전송
 */
export function StoreEditForm({ detail }: { detail: StoreDetail }) {
  const navigate = useNavigate()
  const update = useUpdateStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [addrPending, setAddrPending] = useState(false)
  const [addrError, setAddrError] = useState<string | null>(null)

  const form = useForm<StoreEditInput>({
    resolver: zodResolver(storeEditSchema),
    mode: 'onChange',
    defaultValues: {
      storeName: detail.name,
      storeAddress: null,       // null = 주소 미변경 (Daum 재검색 전까지)
      storeAddressDetail: detail.detailAddress ?? '',
      storePhone: detail.phone,
      storeImageFile: undefined,
    },
  })

  const storeImageFile = form.watch('storeImageFile')
  const storeName = form.watch('storeName')
  const storePhone = form.watch('storePhone')
  // 필수 2필드(매장명·전화)가 채워져야 저장 가능. 주소는 null=미변경(유효)
  const canSave = storeName.trim().length > 0 && storePhone.trim().length > 0

  // 대표 사진 미리보기 — 새 File 에서 object URL 파생 + 정리
  const previewUrl = useMemo(
    () => (storeImageFile ? URL.createObjectURL(storeImageFile) : null),
    [storeImageFile],
  )
  useEffect(() => {
    if (!previewUrl) return
    return () => URL.revokeObjectURL(previewUrl)
  }, [previewUrl])

  // 표시할 이미지 URL: 새 파일 미리보기 > 기존 imageUrl > 없음
  const displayImageUrl = previewUrl ?? detail.imageUrl ?? null

  const onPickFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) return
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) return
    form.setValue('storeImageFile', file, { shouldDirty: true })
  }

  const removePhoto = () => {
    form.setValue('storeImageFile', undefined, { shouldDirty: true })
  }

  // Daum 우편번호 위젯 — 재검색한 경우에만 storeAddress 에 구조화 주소 저장
  const searchAddress = async () => {
    setAddrPending(true)
    setAddrError(null)
    try {
      const address = await searchStoreAddress()
      form.setValue('storeAddress', address, { shouldValidate: true, shouldDirty: true })
    } catch (error) {
      setAddrError(error instanceof Error ? error.message : '주소를 선택하지 못했어요')
    } finally {
      setAddrPending(false)
    }
  }

  function onSubmit(values: StoreEditInput) {
    // 변경 필드 구성: 주소는 Daum 재검색(non-null)한 경우만 포함
    update.mutate(
      {
        storeId: detail.id,
        name: values.storeName,
        phone: values.storePhone,
        detailAddress: values.storeAddressDetail ?? '',
        ...(values.storeAddress !== null && {
          roadAddress: values.storeAddress.roadAddress,
          jibunAddress: values.storeAddress.jibunAddress,
          zonecode: values.storeAddress.zonecode,
          sigunguCode: values.storeAddress.sigunguCode,
          roadnameCode: values.storeAddress.roadnameCode,
        }),
        ...(values.storeImageFile && { imageFile: values.storeImageFile }),
      },
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
          {/* 대표 사진 — 새 파일 선택 시 image 파트 전송. 기존 이미지는 미리보기만 */}
          <div className="mb-5">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              aria-label="매장 대표 사진"
              onChange={onPickFile}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'flex h-[168px] w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-[14px] border-[1.5px] transition',
                displayImageUrl
                  ? 'border-solid border-primary'
                  : 'border-dashed border-border bg-background text-muted-foreground',
              )}
            >
              {displayImageUrl ? (
                <img src={displayImageUrl} alt="매장 대표 사진 미리보기" className="size-full object-cover" />
              ) : (
                <>
                  <span className="text-[34px] leading-none">📷</span>
                  <span className="text-[13.5px] font-semibold">대표 사진 등록</span>
                  <span className="text-[11.5px] text-placeholder">
                    매장 외관이 잘 보이는 사진을 권장해요 (선택)
                  </span>
                </>
              )}
            </button>
            {storeImageFile && (
              <button
                type="button"
                onClick={removePhoto}
                className="mt-2 text-[12.5px] font-semibold text-muted-foreground underline"
              >
                사진 제거
              </button>
            )}
          </div>

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
                      name={field.name}
                      ref={field.ref}
                      onBlur={field.onBlur}
                      // null(미변경)이면 현재 detail.roadAddress 를 표시
                      value={field.value?.roadAddress ?? detail.roadAddress}
                    />
                  </FormControl>
                  <button
                    type="button"
                    onClick={searchAddress}
                    disabled={addrPending}
                    className="absolute right-1.5 top-1/2 h-11 -translate-y-1/2 rounded-lg bg-secondary px-3.5 text-[13px] font-bold text-secondary-foreground disabled:opacity-50"
                  >
                    {addrPending ? '검색 중' : '주소 검색'}
                  </button>
                </div>
                {addrError && <p className="mt-1.5 text-xs text-destructive">{addrError}</p>}
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
      </form>
    </Form>
  )
}
