import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Navigate, useNavigate, useParams } from 'react-router'
import { ChevronLeft } from 'lucide-react'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form'
import { Input } from '@/shared/components/ui/input'
import { TimePicker } from '@/features/store/components/TimePicker'
import { ConfirmSheet } from '@/shared/components/ConfirmSheet'
import { ErrorState } from '@/shared/components/ErrorState'
import { cn } from '@/shared/lib/utils'
import { ApiError } from '@/shared/lib/apiError'
import { ROUTES } from '@/shared/lib/routes'
import { useCurrentStoreStore } from '@/features/store/stores/currentStoreStore'
import { useStoreStatus } from '@/features/store/hooks/useStoreStatus'
import { useClearance } from '../hooks/useClearance'
import { useUpdateClearance } from '../hooks/useUpdateClearance'
import { useCloseClearance } from '../hooks/useCloseClearance'
import { updateClearanceInputSchema } from '../types'
import type { ClearanceCloseReason, ClearanceStatus, UpdateClearanceInput } from '../types'
import { discountRate } from '../lib/clearanceStatus'

const paramsSchema = z.object({ id: z.coerce.number().int().positive() })
const won = (n: number) => `₩${n.toLocaleString('ko-KR')}`

const STATUS_BADGE: Record<ClearanceStatus, { label: string; className: string }> = {
  OPEN: { label: '진행중', className: 'bg-success/10 text-success' },
  CLOSED: { label: '마감', className: 'bg-muted text-muted-foreground' },
  SOLD_OUT: { label: '품절', className: 'bg-muted text-muted-foreground' },
}

/** closeReason 별 마감 사유 문구 */
const CLOSE_REASON_TEXT: Record<ClearanceCloseReason, string> = {
  EXPIRED: '픽업 마감 시각이 지나 마감됐어요.',
  SOLD_OUT: '수량이 모두 소진되어 마감됐어요.',
  MANUAL: '사장님이 직접 마감했어요.',
}

/**
 * 떨이 상세 · 수정 · 조기 마감 (노션: 떨이 상품 수정 / 떨이 상품 마감 처리, 프로토타입 32-deal-detail).
 * 활성(OPEN)일 때만 할인가·남은 수량·픽업 마감 수정 + 조기 마감 가능. 마감되면 읽기전용.
 */
export function ClearanceDetailPage() {
  const navigate = useNavigate()
  const params = useParams()
  const parsed = paramsSchema.safeParse(params)
  const id = parsed.success ? parsed.data.id : 0
  const selectedStoreId = useCurrentStoreStore((s) => s.selectedStoreId)

  const { data: clearance, isLoading, isError, refetch } = useClearance(selectedStoreId, id)
  const { data: status } = useStoreStatus(selectedStoreId)
  const update = useUpdateClearance(id, selectedStoreId)
  const close = useCloseClearance(id, selectedStoreId)

  const [sheetOpen, setSheetOpen] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<UpdateClearanceInput>({
    resolver: zodResolver(updateClearanceInputSchema),
    mode: 'onChange',
    defaultValues: { salePrice: '', remainingQty: '', closeTime: '21:00' },
  })

  const loadedRef = useRef(false)
  useEffect(() => {
    if (!clearance || loadedRef.current) return
    loadedRef.current = true
    form.reset({
      salePrice: String(clearance.salePrice),
      remainingQty: String(clearance.remainingQty),
      closeTime: clearance.closeTime,
    })
  }, [clearance, form])

  if (!parsed.success) return <Navigate to={ROUTES.HOME} replace />

  const editable = clearance?.status === 'OPEN'
  const v = form.watch()
  const original = clearance?.originalPrice ?? 0
  const saleNum = Number(v.salePrice || '0')
  const priceTooHigh = /^\d+$/.test(v.salePrice) && saleNum >= original
  const previewTotal = clearance ? clearance.soldQty + Number(v.remainingQty || '0') : 0
  const todayClose = status?.todayCloseTime

  const onSave = () => {
    if (!clearance || priceTooHigh) return
    setServerError(null)
    update.mutate(
      {
        salePrice: saleNum,
        totalQuantity: clearance.soldQty + Number(v.remainingQty),
        closeTime: v.closeTime,
      },
      {
        onError: (e) =>
          setServerError(
            e instanceof ApiError
              ? e.message
              : '저장 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요.',
          ),
      },
    )
  }

  const onConfirmClose = () => {
    close.mutate(undefined, { onSuccess: () => setSheetOpen(false) })
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-card pb-10">
      <header className="sticky top-0 z-10 flex h-[52px] items-center gap-1 border-b border-border bg-card px-2">
        <button
          type="button"
          aria-label="뒤로 가기"
          onClick={() => navigate(-1)}
          className="flex size-10 items-center justify-center rounded-full text-foreground active:bg-muted"
        >
          <ChevronLeft className="size-[22px]" />
        </button>
        <h1 className="text-[16px] font-bold">마감 할인 상세</h1>
      </header>

      {isLoading && (
        <p className="py-16 text-center text-[14px] text-muted-foreground">불러오는 중…</p>
      )}

      {!isLoading && (isError || !clearance) && (
        <ErrorState icon="🔥" onRetry={() => refetch()}>
          마감 할인을 찾을 수 없어요.
        </ErrorState>
      )}

      {clearance && (
        <div className="flex flex-col gap-3 px-5 pt-4">
          {/* 헤드 카드 (프로토타입 dd-head — 테두리 카드) */}
          <div className="flex items-center gap-3.5 rounded-[16px] border border-border bg-card px-[18px] py-4">
            <span className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-[14px] bg-cream text-[28px]">
              {clearance.productImageUrl ? (
                <img
                  src={clearance.productImageUrl}
                  alt={clearance.productName}
                  className="size-full object-cover"
                />
              ) : (
                '🍞'
              )}
            </span>
            <div className="flex min-w-0 flex-col items-start gap-1.5">
              <p className="truncate text-[17px] font-extrabold text-foreground">
                {clearance.productName}
              </p>
              <span
                className={cn(
                  'inline-block rounded-lg px-2 py-0.5 text-[11px] font-bold',
                  STATUS_BADGE[clearance.status].className,
                )}
              >
                {STATUS_BADGE[clearance.status].label}
              </span>
            </div>
          </div>

          {/* 판매 현황 */}
          <section className="rounded-[14px] border border-border bg-card p-4">
            <p className="mb-2 text-[13px] font-bold text-foreground">판매 현황</p>
            <p className="text-[14px]">
              <s className="text-[12px] text-muted-foreground">{won(original)}</s>{' '}
              <span className="mr-0.5 font-extrabold text-destructive">
                {discountRate(original, clearance.salePrice)}%
              </span>
              <b className="font-extrabold text-primary">{won(clearance.salePrice)}</b>
            </p>
            <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-background">
              <div
                className="h-full rounded-full bg-primary"
                style={{
                  width: `${clearance.totalQty > 0 ? Math.round((clearance.soldQty / clearance.totalQty) * 100) : 0}%`,
                }}
              />
            </div>
            <div className="mt-1.5 flex justify-between text-[11.5px] font-semibold text-muted-foreground">
              <span>
                {clearance.soldQty} / {clearance.totalQty} 판매
              </span>
              <span>마감 {clearance.closeTime}</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-background px-3 py-2.5">
                <p className="text-[11.5px] text-muted-foreground">남은 수량</p>
                <p className="mt-0.5 text-[15px] font-extrabold text-foreground">
                  {clearance.remainingQty}개
                </p>
              </div>
              <div className="rounded-xl bg-background px-3 py-2.5">
                <p className="text-[11.5px] text-muted-foreground">예상 매출</p>
                <p className="mt-0.5 text-[15px] font-extrabold text-foreground">
                  {won(clearance.salePrice * clearance.totalQty)}
                </p>
              </div>
            </div>
          </section>

          {/* 수정 (활성만) */}
          {editable ? (
            <Form {...form}>
              <form
                className="rounded-[14px] border border-border bg-card p-4"
                onSubmit={(e) => e.preventDefault()}
              >
                <p className="mb-3 text-[13px] font-bold text-foreground">마감 할인 정보 수정</p>

                <FormField
                  control={form.control}
                  name="salePrice"
                  render={({ field }) => (
                    <FormItem className="mb-4">
                      <FormLabel>할인가</FormLabel>
                      <FormControl>
                        <Input type="text" inputMode="numeric" placeholder="할인가" {...field} />
                      </FormControl>
                      {priceTooHigh ? (
                        <p className="mt-1.5 text-[12px] font-medium text-destructive">
                          정상가({won(original)})보다 낮은 금액을 입력해 주세요.
                        </p>
                      ) : (
                        <FormMessage />
                      )}
                    </FormItem>
                  )}
                />

                <div className="mb-4 grid grid-cols-2 gap-2.5">
                  <FormField
                    control={form.control}
                    name="remainingQty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>남은 수량</FormLabel>
                        <FormControl>
                          <Input type="text" inputMode="numeric" placeholder="남은 수량" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground">등록 수량</p>
                    <div className="mt-2 flex h-[52px] items-center rounded-[12px] border-[1.5px] border-input bg-background px-4 text-[16px] font-bold text-muted-foreground">
                      {previewTotal}개
                    </div>
                  </div>
                </div>
                <p className="-mt-2 mb-4 text-[12px] text-muted-foreground">
                  남은 수량을 0으로 저장하면 품절로 마감돼요. 등록 수량 = 판매 + 남은 수량.
                </p>

                <FormField
                  control={form.control}
                  name="closeTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>픽업 마감 시각</FormLabel>
                      <FormControl>
                        <TimePicker
                          value={field.value}
                          onChange={field.onChange}
                          ariaLabel="픽업 마감 시각"
                        />
                      </FormControl>
                      <p className="mt-1.5 text-[12px] text-muted-foreground">
                        {todayClose
                          ? `오늘 영업 종료(${todayClose}) 이전, 현재 시각 이후로 설정해 주세요.`
                          : '현재 시각 이후로 설정해 주세요.'}
                      </p>
                    </FormItem>
                  )}
                />

                {serverError && (
                  <p role="alert" className="mt-3 text-[13px] font-medium text-destructive">
                    {serverError}
                  </p>
                )}
                {update.isSuccess && !serverError && (
                  <p className="mt-3 text-[13px] font-medium text-success">변경 사항을 저장했어요.</p>
                )}
              </form>
            </Form>
          ) : (
            <section className="rounded-[14px] border border-border bg-card p-4">
              <p className="text-[13px] font-bold text-foreground">마감된 마감 할인</p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                {(clearance.closeReason ? CLOSE_REASON_TEXT[clearance.closeReason] : null) ??
                  '마감된 마감 할인이에요.'}{' '}
                마감된 마감 할인은 수정하거나 다시 시작할 수 없어요.
              </p>
            </section>
          )}
        </div>
      )}

      {/* CTA — 활성만, 내용 흐름 배치(하단 고정 X) */}
      {clearance && editable && (
        <div className="mt-8 flex flex-col gap-2.5 px-5">
          <button
            type="button"
            onClick={onSave}
            disabled={!form.formState.isValid || priceTooHigh || update.isPending}
            className="h-[54px] w-full rounded-xl bg-primary text-base font-bold tracking-[-0.3px] text-white transition active:scale-[0.98] disabled:bg-primary-disabled disabled:active:scale-100"
          >
            {update.isPending ? '저장 중…' : '변경 저장'}
          </button>
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="h-[54px] w-full rounded-xl bg-background text-base font-bold text-muted-foreground transition active:scale-[0.98]"
          >
            마감 할인 조기 마감
          </button>
        </div>
      )}

      <ConfirmSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        title="마감 할인을 지금 마감할까요?"
        description="마감하면 고객 앱에서 즉시 내려가고, 남은 수량은 더 이상 판매되지 않아요. 되돌릴 수 없어요."
        confirmLabel={close.isPending ? '마감 중…' : '마감 할인 마감'}
        onConfirm={onConfirmClose}
        isPending={close.isPending}
      />
    </div>
  )
}
