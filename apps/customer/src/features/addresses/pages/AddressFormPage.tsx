import { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation, Navigate } from 'react-router'
import { ChevronLeft, Trash2 } from 'lucide-react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/shared/components/ui/form'
import { Input } from '@/shared/components/ui/input'
import { cn } from '@/shared/lib/utils'
import { ApiError } from '@/shared/lib/apiError'
import { ROUTES } from '@/shared/lib/routes'
import { ScreenContainer } from '@/shared/components/ScreenContainer'
import { useAddresses } from '../hooks/useAddresses'
import { useCreateAddress } from '../hooks/useCreateAddress'
import { useUpdateAddress } from '../hooks/useUpdateAddress'
import { useDeleteAddress } from '../hooks/useDeleteAddress'
import { searchAddressForAddresses } from '../lib/addressSearch'
import { addressFormSchema, type AddressFormValues, type AddressSearchResult } from '../types'

/** 별칭 빠른 선택 칩 (프로토타입 64-addr-edit) */
const LABEL_CHIPS = [
  { label: '우리집', emoji: '🏠' },
  { label: '회사', emoji: '🏢' },
  { label: '학교', emoji: '📚' },
  { label: '기타', emoji: '💗' },
]

/**
 * 주소 추가/수정 (프로토타입 64-addr-edit). add/edit 공용.
 * - 도로명은 다음 우편번호 위젯(명령형 팝업) 또는 GPS 역지오코딩 결과(roadResult). add 는 목록에서
 *   넘어온 state, edit 는 기존 주소에서 시작.
 * - '다시 검색'으로 도로명 변경 가능(add·edit 둘 다 — 노션 2026-05-31 결정).
 * - 제출 payload 분기 (X3 / findings A3-1·A3-2·A3-3): GPS 결과는 좌표(lat/lng)를 직접 전송,
 *   검색(다음 위젯) 결과는 sigunguCode+roadnameCode 코드를 전송 → BE 가 지오코딩.
 */
export function AddressFormPage() {
  const { id } = useParams()
  const numericId = id ? Number(id) : undefined
  const isEdit = Boolean(numericId)
  const navigate = useNavigate()
  const location = useLocation()
  const navState = (location.state as { result?: AddressSearchResult } | null) ?? null

  const { data: addresses, isPending: addressesPending } = useAddresses()
  const existing = isEdit ? addresses?.find((a) => a.id === numericId) : undefined

  const [roadResult, setRoadResult] = useState<AddressSearchResult | null>(navState?.result ?? null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const create = useCreateAddress()
  const update = useUpdateAddress()
  const remove = useDeleteAddress()

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressFormSchema),
    mode: 'onChange',
    defaultValues: { label: '', detailAddress: '' },
  })

  // edit: 기존 주소가 로드되면 폼 채우기 (도로명은 effectiveRoad 로 파생 — setState-in-effect 회피)
  useEffect(() => {
    if (existing)
      form.reset({ label: existing.label, detailAddress: existing.detailAddress ?? '' })
  }, [existing, form])

  /**
   * 도로명 = '다시 검색' override(roadResult) ?? (edit) 기존 주소 ?? (add) 진입 state 결과.
   * 기존 주소에는 sigunguCode/roadnameCode 가 없으므로, 재검색 없이 별칭·상세만 고칠 때를 위해
   * 기존 좌표(latitude/longitude)를 실어 보낸다 — BE @AssertTrue(좌표 OR 코드)를 만족시켜
   * 좌표 누락 400 을 막는다 (findings BUG-B, 등록 경로 #120 과 대칭). 재검색 시엔 roadResult 의 코드를 사용.
   */
  const effectiveRoad: AddressSearchResult | null =
    roadResult ??
    (existing
      ? {
          roadAddress: existing.roadAddress,
          jibunAddress: existing.jibunAddress,
          zonecode: existing.zonecode,
          latitude: existing.latitude,
          longitude: existing.longitude,
        }
      : null)
  const displayRoad = effectiveRoad?.roadAddress
  const labelValue = useWatch({ control: form.control, name: 'label' })

  // mutation — isEdit ? update : create. 두 mutation 에서 error/isPending 만 공통 사용
  const serverError = (() => {
    const err = isEdit ? update.error : create.error
    if (!err) return null
    return err instanceof ApiError ? err.message : '저장 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.'
  })()
  const isMutationPending = isEdit ? update.isPending : create.isPending

  const onSubmit = (values: AddressFormValues) => {
    if (!effectiveRoad) return
    // GPS 경로(좌표 보유)는 raw 좌표를 직접 전송하고 코드는 생략, 검색 경로는 코드를 전송 (X3).
    const hasCoords = effectiveRoad.latitude != null && effectiveRoad.longitude != null
    const payload = {
      label: values.label,
      detailAddress: values.detailAddress || undefined,
      roadAddress: effectiveRoad.roadAddress,
      jibunAddress: effectiveRoad.jibunAddress,
      zonecode: effectiveRoad.zonecode,
      ...(hasCoords
        ? { latitude: effectiveRoad.latitude, longitude: effectiveRoad.longitude }
        : { sigunguCode: effectiveRoad.sigunguCode, roadnameCode: effectiveRoad.roadnameCode }),
    }
    if (isEdit && numericId) {
      update.mutate({ id: numericId, input: payload }, { onSuccess: () => navigate(ROUTES.ADDRESSES) })
    } else {
      create.mutate(payload, { onSuccess: () => navigate(ROUTES.ADDRESSES) })
    }
  }

  const handleDelete = () => {
    if (!numericId || !window.confirm('이 주소를 삭제할까요?')) return
    setDeleteError(null)
    remove.mutate(numericId, {
      onSuccess: () => navigate(ROUTES.ADDRESSES),
      onError: (e) =>
        setDeleteError(e instanceof ApiError ? e.message : '삭제 중 문제가 발생했어요.'),
    })
  }

  async function handleReSearch() {
    try {
      const result = await searchAddressForAddresses()
      setRoadResult(result)
    } catch {
      // 위젯 팝업 닫기(취소) — 에러 없이 무시
    }
  }

  // 가드: edit인데 없는 주소 / add인데 도로명 없음 → 목록으로
  if (isEdit && !addressesPending && !existing) return <Navigate to={ROUTES.ADDRESSES} replace />
  if (!isEdit && !effectiveRoad) return <Navigate to={ROUTES.ADDRESSES} replace />

  const saveDisabled = !displayRoad || !form.formState.isValid || isMutationPending

  return (
    <ScreenContainer variant="page">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-10 flex h-[52px] items-center gap-1 border-b border-border bg-card px-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label="뒤로 가기"
              className="flex h-10 w-10 items-center justify-center text-foreground"
            >
              <ChevronLeft className="h-[22px] w-[22px]" />
            </button>
            <h1 className="flex-1 text-[17px] font-bold text-foreground">
              {isEdit ? '주소 수정' : '주소 추가'}
            </h1>
            {isEdit && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={remove.isPending}
                aria-label="주소 삭제"
                className="flex h-10 w-10 items-center justify-center text-muted-foreground disabled:opacity-50"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            )}
          </header>

          <main className="flex-1 px-5 pt-4">
            {/* 도로명 */}
            <section className="mb-5">
              <div className="mb-2.5 flex items-baseline gap-1.5 text-[13px] font-bold text-foreground">
                도로명 주소<span className="text-primary">*</span>
              </div>
              <div className="flex min-h-[54px] items-center gap-2.5 rounded-xl border-[1.25px] border-border bg-background px-3.5">
                <span aria-hidden className="text-[18px]">
                  📍
                </span>
                <span
                  className={cn(
                    'text-sm leading-[1.4]',
                    displayRoad ? 'font-bold text-foreground' : 'font-normal text-placeholder',
                  )}
                >
                  {displayRoad ?? '주소를 선택해주세요'}
                </span>
              </div>
              <button
                type="button"
                onClick={handleReSearch}
                className="mt-2 text-[12.5px] font-bold text-secondary-foreground"
              >
                다시 검색
              </button>
            </section>

            {/* 별칭 */}
            <section className="mb-5">
              <div className="mb-2.5 flex items-baseline gap-1.5 text-[13px] font-bold text-foreground">
                별칭<span className="text-primary">*</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {LABEL_CHIPS.map((chip) => (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={() =>
                      form.setValue('label', chip.label, { shouldValidate: true, shouldDirty: true })
                    }
                    className={cn(
                      'min-h-9 rounded-[18px] border-[1.25px] px-3.5 py-2 text-[13px] transition',
                      labelValue === chip.label
                        ? 'border-primary bg-secondary font-bold text-secondary-foreground'
                        : 'border-border bg-card font-semibold text-muted-foreground',
                    )}
                  >
                    {chip.emoji} {chip.label}
                  </button>
                ))}
              </div>
              <FormField
                control={form.control}
                name="label"
                render={({ field }) => (
                  <FormItem className="mt-2.5">
                    <FormControl>
                      <Input maxLength={10} placeholder="별칭을 입력하세요 (예: 우리집)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>

            {/* 상세 주소 */}
            <section className="mb-5">
              <FormField
                control={form.control}
                name="detailAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">상세 주소</FormLabel>
                    <FormControl>
                      <Input maxLength={40} placeholder="동·호수, 건물명 등" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>
          </main>

          <div className="sticky bottom-0 border-t border-border bg-card p-5">
            {(serverError || deleteError) && (
              <p role="alert" className="mb-3 text-[13px] font-medium text-destructive">
                {serverError ?? deleteError}
              </p>
            )}
            <button
              type="submit"
              disabled={saveDisabled}
              className="h-[54px] w-full rounded-xl bg-primary text-base font-bold tracking-[-0.3px] text-white transition active:scale-[0.98] disabled:bg-primary-disabled disabled:active:scale-100"
            >
              {isMutationPending ? '저장 중…' : isEdit ? '저장' : '추가하기'}
            </button>
          </div>
        </form>
      </Form>
    </ScreenContainer>
  )
}
