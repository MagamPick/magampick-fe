import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/shared/components/ui/form'
import { CalendarIcon } from 'lucide-react'
import { Input } from '@/shared/components/ui/input'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/shared/components/ui/sheet'
import { Calendar } from '@/shared/components/ui/calendar'
import { cn } from '@/shared/lib/utils'
import { useBusinessCheck } from '../hooks/useBusinessCheck'
import { searchStoreAddress } from '../lib/addressSearch'
import type { SignupInput } from '../types'

/** 대표 사진 최대 용량(MB) */
const MAX_IMAGE_MB = 5

// 프로토타입 bizNo input — 숫자 10자리 → 000-00-00000 자동 포맷
function formatBizNo(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 10)
  if (d.length > 5) return `${d.slice(0, 3)}-${d.slice(3, 5)}-${d.slice(5)}`
  if (d.length > 3) return `${d.slice(0, 3)}-${d.slice(3)}`
  return d
}

// 캘린더(Date) ↔ 폼 값('YYYY-MM-DD') 변환 — toISOString 은 UTC 라 로컬 기준 직접 포맷
const toYMD = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const parseYMD = (s: string) => {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function Step5Store({ form }: { form: UseFormReturn<SignupInput> }) {
  const biz = useBusinessCheck()
  const [dateOpen, setDateOpen] = useState(false)
  const [addrPending, setAddrPending] = useState(false)
  const [addrError, setAddrError] = useState<string | null>(null)
  const [photoError, setPhotoError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const storeImageFile = form.watch('storeImageFile')
  const representativeName = form.watch('representativeName')
  const businessNumber = form.watch('businessNumber')
  const openDate = form.watch('openDate')
  const bizDigits = (businessNumber ?? '').replace(/\D/g, '')

  // 대표자명 기본값 = Step 4 사장님 성명 (첫 매장은 보통 본인). 비어있을 때만 1회 채움 — 수정 가능.
  useEffect(() => {
    if (!form.getValues('representativeName') && form.getValues('name')) {
      form.setValue('representativeName', form.getValues('name'))
    }
  }, [form])

  // 대표 사진 미리보기 — File 에서 object URL 파생(리마운트에도 유지) + 정리
  const previewUrl = useMemo(
    () => (storeImageFile ? URL.createObjectURL(storeImageFile) : null),
    [storeImageFile],
  )
  useEffect(() => {
    if (!previewUrl) return
    return () => URL.revokeObjectURL(previewUrl)
  }, [previewUrl])

  const onPickFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // 같은 파일 재선택 허용
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setPhotoError('이미지 파일만 등록할 수 있어요')
      return
    }
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      setPhotoError(`이미지는 ${MAX_IMAGE_MB}MB 이하만 등록할 수 있어요`)
      return
    }
    setPhotoError(null)
    form.setValue('storeImageFile', file, { shouldDirty: true })
  }

  const removePhoto = () => {
    form.setValue('storeImageFile', undefined, { shouldDirty: true })
    setPhotoError(null)
  }

  // 진위확인 입력(대표자명·번호·개업일자) 변경 시 조회 결과·검증 플래그 리셋 (재조회 강제)
  const resetBiz = () => {
    form.setValue('bizVerified', false)
    if (biz.isSuccess || biz.isError) biz.reset()
  }

  const onBizChange = (raw: string) => {
    form.setValue('businessNumber', formatBizNo(raw), { shouldValidate: true })
    resetBiz()
  }

  const checkBiz = () =>
    biz.mutate(
      { businessNumber, representativeName, openDate },
      { onSuccess: () => form.setValue('bizVerified', true, { shouldValidate: true }) },
    )

  const canCheck =
    bizDigits.length === 10 &&
    representativeName.trim().length > 0 &&
    openDate.trim().length > 0 &&
    !biz.isPending

  // 다음 우편번호 위젯 — 도로명 주소 + 지오코딩 키(sigunguCode·roadnameCode)를 받아 구조화 저장
  const searchAddress = async () => {
    setAddrPending(true)
    setAddrError(null)
    try {
      const address = await searchStoreAddress()
      form.setValue('storeAddress', address, { shouldValidate: true, shouldDirty: true })
      form.clearErrors('storeAddress')
    } catch (error) {
      setAddrError(error instanceof Error ? error.message : '주소를 선택하지 못했어요')
    } finally {
      setAddrPending(false)
    }
  }

  return (
    <div>
      <h2 className="text-[21px] font-extrabold leading-snug tracking-tight text-foreground">
        매장 정보를
        <br />
        입력해 주세요
      </h2>
      <p className="mb-7 mt-2 text-sm leading-relaxed text-muted-foreground">
        사업자등록번호와 매장 정보를 함께 등록합니다.
      </p>

      {/* 대표 사진 — 선택 업로드 (multipart image 파트). 없어도 가입 완료 */}
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
            storeImageFile
              ? 'border-solid border-primary'
              : 'border-dashed border-border bg-background text-muted-foreground',
          )}
        >
          {previewUrl ? (
            <img src={previewUrl} alt="매장 대표 사진 미리보기" className="size-full object-cover" />
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
        {photoError && <p className="mt-1.5 text-xs text-destructive">{photoError}</p>}
      </div>

      <FormField
        control={form.control}
        name="representativeName"
        render={({ field }) => (
          <FormItem className="mb-4">
            <FormLabel>
              대표자명<span aria-hidden="true" className="text-primary">*</span>
            </FormLabel>
            <FormControl>
              <Input
                placeholder="대표자 실명"
                {...field}
                onChange={(e) => {
                  field.onChange(e)
                  resetBiz()
                }}
              />
            </FormControl>
            <p className="mt-1.5 text-xs text-muted-foreground">
              사업자등록증상 대표자명 — 사장님 본인이면 그대로 두세요.
            </p>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="businessNumber"
        render={({ field }) => (
          <FormItem className="mb-4">
            <FormLabel>
              사업자등록번호<span aria-hidden="true" className="text-primary">*</span>
            </FormLabel>
            <div className="relative">
              <FormControl>
                <Input
                  inputMode="numeric"
                  placeholder="000-00-00000"
                  maxLength={12}
                  className="pr-[92px]"
                  name={field.name}
                  ref={field.ref}
                  value={field.value}
                  onBlur={field.onBlur}
                  onChange={(e) => onBizChange(e.target.value)}
                />
              </FormControl>
              <button
                type="button"
                disabled={!canCheck}
                onClick={checkBiz}
                className="absolute right-1.5 top-1/2 h-11 -translate-y-1/2 rounded-lg bg-secondary px-3.5 text-[13px] font-bold text-secondary-foreground disabled:opacity-50"
              >
                조회하기
              </button>
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              대표자명·개업일자와 함께 진위확인합니다. 숫자 10자리를 입력하면 자동 정리돼요.
            </p>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="openDate"
        render={({ field }) => (
          <FormItem className="mb-4">
            <FormLabel>
              개업일자<span aria-hidden="true" className="text-primary">*</span>
            </FormLabel>
            <button
              type="button"
              onClick={() => setDateOpen(true)}
              className="flex h-[50px] w-full items-center justify-between rounded-[10px] border-[1.5px] border-input bg-card px-3.5 text-[15px] text-foreground outline-none transition focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-secondary"
            >
              <span className={cn(!field.value && 'text-placeholder')}>
                {field.value ? field.value.replace(/-/g, '. ') + '.' : '날짜를 선택하세요'}
              </span>
              <CalendarIcon className="size-[18px] text-muted-foreground" />
            </button>
            <p className="mt-1.5 text-xs text-muted-foreground">
              사업자등록증상 개업일자를 선택해 주세요.
            </p>
            <FormMessage />
            <Sheet open={dateOpen} onOpenChange={setDateOpen}>
              <SheetContent side="bottom" className="rounded-t-[22px] pb-5">
                <SheetHeader>
                  <SheetTitle>개업일자 선택</SheetTitle>
                </SheetHeader>
                <div className="px-2">
                  <Calendar
                    className="w-full"
                    mode="single"
                    selected={field.value ? parseYMD(field.value) : undefined}
                    defaultMonth={field.value ? parseYMD(field.value) : undefined}
                    onSelect={(d) => {
                      field.onChange(d ? toYMD(d) : '')
                      resetBiz()
                      if (d) setDateOpen(false)
                    }}
                    disabled={{ after: new Date() }}
                    autoFocus
                  />
                </div>
              </SheetContent>
            </Sheet>
          </FormItem>
        )}
      />

      {biz.isSuccess && (
        <div className="mb-4 flex items-start gap-2.5 rounded-xl bg-success-subtle px-4 py-3.5 text-[13.5px] font-semibold leading-normal text-success">
          <span className="text-base leading-none">✅</span>
          <span>정상 등록된 사업자입니다.</span>
        </div>
      )}
      {biz.isError && (
        <div className="mb-4 flex items-start gap-2.5 rounded-xl bg-destructive-subtle px-4 py-3.5 text-[13.5px] font-semibold leading-normal text-destructive">
          <span className="text-base leading-none">⚠️</span>
          <span>
            조회되지 않는 사업자등록번호입니다.
            <br />
            번호·대표자명·개업일자를 다시 확인해 주세요.
          </span>
        </div>
      )}

      <FormField
        control={form.control}
        name="storeName"
        render={({ field }) => (
          <FormItem className="mb-4">
            <FormLabel>
              매장명<span aria-hidden="true" className="text-primary">*</span>
            </FormLabel>
            <FormControl>
              <Input placeholder="예) 마감픽 베이커리 역삼점" {...field} />
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
              매장 주소<span aria-hidden="true" className="text-primary">*</span>
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
                onClick={searchAddress}
                disabled={addrPending}
                className="absolute right-1.5 top-1/2 h-11 -translate-y-1/2 rounded-lg bg-secondary px-3.5 text-[13px] font-bold text-secondary-foreground"
              >
                {addrPending ? '검색 중' : '주소 검색'}
              </button>
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              도로명·지번 모두 검색 가능해요. 위치는 등록한 주소를 기준으로 자동 설정됩니다.
            </p>
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
              매장 전화번호<span aria-hidden="true" className="text-primary">*</span>
            </FormLabel>
            <FormControl>
              <Input type="tel" inputMode="numeric" placeholder="02-0000-0000" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
