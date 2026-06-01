import { Fragment, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useSearchParams } from 'react-router'
import { ChevronLeft, Check } from 'lucide-react'
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
import { useStoreStatus } from '@/features/store/hooks/useStoreStatus'
import { cn } from '@/shared/lib/utils'
import { ApiError } from '@/shared/lib/apiError'
import { ROUTES } from '@/shared/lib/routes'
import { useCurrentStoreStore } from '@/features/store/stores/currentStoreStore'
import { useProducts } from '@/features/product/hooks/useProducts'
import { useClearances } from '../hooks/useClearances'
import { useCreateClearance } from '../hooks/useCreateClearance'
import { createClearanceInputSchema } from '../types'
import type { CreateClearanceInput } from '../types'
import { discountRate, nowHHMM } from '../lib/clearanceStatus'

const STEP_NAMES = ['상품 선택', '수량·가격', '픽업 시간', '확인']
const TOTAL = STEP_NAMES.length
const won = (n: number) => `₩${n.toLocaleString('ko-KR')}`
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/

/** 떨이 등록 진행 표시 (signup 트랙과 동일 스타일, 4스텝) */
function ClearanceProgress({ step }: { step: number }) {
  return (
    <div className="shrink-0 border-b border-border px-5 pb-3.5 pt-4">
      <div className="mb-2.5 flex items-center">
        {STEP_NAMES.map((_, i) => {
          const n = i + 1
          const done = n < step
          const current = n === step
          return (
            <Fragment key={n}>
              {i > 0 && (
                <span
                  className={cn('mx-[3px] h-0.5 flex-1', n - 1 < step ? 'bg-primary' : 'bg-border')}
                />
              )}
              <span
                className={cn(
                  'flex size-[26px] shrink-0 items-center justify-center rounded-full border-[1.5px] text-xs font-bold transition',
                  done || current
                    ? 'border-primary bg-primary text-white'
                    : 'border-border bg-background text-muted-foreground',
                  current && 'ring-4 ring-secondary',
                )}
              >
                {done ? <Check className="size-3.5" strokeWidth={3.5} /> : n}
              </span>
            </Fragment>
          )
        })}
      </div>
      <p className="text-[13px] font-semibold text-muted-foreground">
        STEP <b className="text-primary">{step}</b> / <b className="text-primary">{TOTAL}</b> ·{' '}
        {STEP_NAMES[step - 1]}
      </p>
    </div>
  )
}

/**
 * 일반 상품 → 떨이 전환(등록) 4-step 위저드 (노션: 일반 상품 떨이 전환 / 프로토타입 31-deal-create).
 * step1 상품선택 → step2 수량·할인가 → step3 픽업 마감 → step4 확인.
 * `?productId` 로 진입(상품 상세에서) 하면 해당 상품 사전선택 후 step2 부터.
 * 영업 상태 OPEN 일 때만 등록 가능 — 그 외엔 안내 화면.
 */
export function ClearanceCreatePage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const preselectId = params.get('productId') ?? ''
  const storeId = useCurrentStoreStore((s) => s.selectedStoreId)

  const { data: products = [], isLoading: loadingProducts } = useProducts(storeId)
  const { data: clearances = [] } = useClearances(storeId)
  const { data: status, isLoading: loadingStatus } = useStoreStatus(storeId)
  const create = useCreateClearance(storeId)

  const activeProductIds = new Set(
    clearances.filter((c) => c.status === 'ACTIVE').map((c) => c.productId),
  )
  const eligible = products.filter((p) => p.onSale && !activeProductIds.has(p.id))

  const form = useForm<CreateClearanceInput>({
    resolver: zodResolver(createClearanceInputSchema),
    mode: 'onChange',
    defaultValues: { productId: '', totalQty: '', salePrice: '', closeTime: '21:00' },
  })

  const [step, setStep] = useState(1)
  const [serverError, setServerError] = useState<string | null>(null)

  // 상품 상세에서 진입(?productId) + 전환 가능하면 사전선택 후 step2 부터
  const initRef = useRef(false)
  useEffect(() => {
    if (initRef.current || !preselectId || loadingProducts) return
    initRef.current = true
    if (eligible.some((p) => p.id === preselectId)) {
      form.setValue('productId', preselectId, { shouldValidate: true })
      setStep(2)
    }
  }, [preselectId, loadingProducts, eligible, form])

  const v = form.watch()
  const selected = products.find((p) => p.id === v.productId)
  const original = selected?.price ?? 0
  const saleNum = Number(v.salePrice || '0')
  const rate = selected && /^\d+$/.test(v.salePrice) ? discountRate(original, saleNum) : null
  const todayClose = status?.todayCloseTime

  const stepValid = ((): boolean => {
    switch (step) {
      case 1:
        return !!v.productId
      case 2: {
        const qtyOk = /^\d+$/.test(v.totalQty) && Number(v.totalQty) >= 1
        const priceOk =
          /^\d+$/.test(v.salePrice) && (!selected || (saleNum >= 0 && saleNum < original))
        return qtyOk && priceOk
      }
      case 3:
        return (
          TIME_RE.test(v.closeTime) &&
          v.closeTime > nowHHMM() &&
          (!todayClose || v.closeTime <= todayClose)
        )
      case 4:
        return !!selected && form.formState.isValid
      default:
        return false
    }
  })()

  const goNext = () => {
    if (!stepValid) return
    if (step < TOTAL) {
      setStep((s) => s + 1)
      return
    }
    setServerError(null)
    create.mutate(
      {
        productId: v.productId,
        salePrice: saleNum,
        totalQty: Number(v.totalQty),
        closeTime: v.closeTime,
      },
      {
        onSuccess: () => navigate(`${ROUTES.PRODUCTS}?tab=deal`),
        onError: (e) =>
          setServerError(
            e instanceof ApiError
              ? e.message
              : '등록 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요.',
          ),
      },
    )
  }
  const goPrev = () => {
    if (step > 1) setStep((s) => s - 1)
    else navigate(-1)
  }

  const notOpen = !loadingStatus && status && status.operationStatus !== 'OPEN'

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col bg-card">
      <header className="flex h-[52px] shrink-0 items-center gap-1 border-b border-border px-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="뒤로 가기"
          className="flex size-10 items-center justify-center rounded-full text-foreground active:bg-muted"
        >
          <ChevronLeft className="size-[22px]" />
        </button>
        <h1 className="text-[16px] font-bold">마감 할인 등록</h1>
      </header>

      {notOpen ? (
        <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
          <p className="text-[40px]">🌙</p>
          <p className="mt-3 text-[15px] font-bold text-foreground">지금은 등록할 수 없어요</p>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted-foreground">
            영업 중일 때만 마감 할인을 등록할 수 있어요.
            <br />
            매장 영업 상태를 먼저 확인해 주세요.
          </p>
        </div>
      ) : (
        <>
          <ClearanceProgress step={step} />
          <Form {...form}>
            <form className="flex min-h-0 flex-1 flex-col" onSubmit={(e) => e.preventDefault()}>
              <div className="flex-1 px-5 pb-4 pt-6">
                {/* STEP 1 — 상품 선택 */}
                {step === 1 && (
                  <div>
                    <h2 className="text-[21px] font-extrabold leading-snug tracking-tight text-foreground">
                      어떤 상품을
                      <br />
                      마감 할인으로 내놓을까요?
                    </h2>
                    <p className="mb-6 mt-2 text-sm leading-relaxed text-muted-foreground">
                      판매 중인 상품 중 마감 세일할 상품을 선택하세요.
                    </p>

                    {loadingProducts ? (
                      <p className="py-12 text-center text-[14px] text-muted-foreground">
                        불러오는 중…
                      </p>
                    ) : eligible.length === 0 ? (
                      <div className="px-6 py-12 text-center">
                        <p className="text-[34px]">🛒</p>
                        <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
                          마감 할인으로 등록할 수 있는 상품이 없어요.
                          <br />
                          판매 중이고 진행 중인 마감 할인이 없는 상품만 선택할 수 있어요.
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {eligible.map((p) => {
                          const on = v.productId === p.id
                          return (
                            <button
                              key={p.id}
                              type="button"
                              aria-pressed={on}
                              onClick={() =>
                                form.setValue('productId', p.id, { shouldValidate: true })
                              }
                              className={cn(
                                'flex items-center gap-3 rounded-[14px] border-[1.5px] bg-card p-3 text-left transition',
                                on ? 'border-primary bg-secondary' : 'border-border',
                              )}
                            >
                              <span className="flex size-[52px] shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-secondary text-[24px]">
                                {p.imageUrl ? (
                                  <img
                                    src={p.imageUrl}
                                    alt={p.name}
                                    className="size-full object-cover"
                                  />
                                ) : (
                                  '🍽️'
                                )}
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-[14px] font-bold text-foreground">
                                  {p.name}
                                </span>
                                <span className="mt-0.5 block text-[12px] text-muted-foreground">
                                  {p.category}
                                </span>
                                <span className="mt-1 block text-[14px] font-extrabold text-foreground">
                                  {won(p.price)}
                                </span>
                              </span>
                              {on && <Check className="size-5 shrink-0 text-primary" strokeWidth={3} />}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 2 — 수량·가격 */}
                {step === 2 && (
                  <div>
                    <h2 className="text-[21px] font-extrabold leading-snug tracking-tight text-foreground">
                      마감 할인 수량과
                      <br />
                      할인가를 정해 주세요
                    </h2>
                    <p className="mb-6 mt-2 text-sm leading-relaxed text-muted-foreground">
                      정상가 대비 할인율이 자동 계산돼요.
                    </p>

                    <div className="mb-4">
                      <p className="mb-1.5 text-[13px] font-bold text-foreground">선택 상품</p>
                      <div className="flex items-center justify-between rounded-xl bg-background px-4 py-3.5">
                        <span className="truncate text-[14px] font-bold text-foreground">
                          {selected?.name ?? '—'}
                        </span>
                        <span className="shrink-0 text-[13px] font-semibold text-muted-foreground">
                          정상가 {won(original)}
                        </span>
                      </div>
                    </div>

                    <FormField
                      control={form.control}
                      name="totalQty"
                      render={({ field }) => (
                        <FormItem className="mb-4">
                          <FormLabel>
                            마감 할인 수량<span className="ml-0.5 text-primary">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              inputMode="numeric"
                              placeholder="예) 20"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="salePrice"
                      render={({ field }) => (
                        <FormItem className="mb-2">
                          <FormLabel>
                            마감 할인가<span className="ml-0.5 text-primary">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              inputMode="numeric"
                              placeholder="할인가 입력"
                              {...field}
                            />
                          </FormControl>
                          {selected && /^\d+$/.test(v.salePrice) && saleNum >= original ? (
                            <p className="mt-1.5 text-[12px] font-medium text-destructive">
                              정상가({won(original)})보다 낮은 금액을 입력해 주세요.
                            </p>
                          ) : (
                            <p className="mt-1.5 text-[12px] text-muted-foreground">
                              정상가보다 낮은 금액을 입력하세요.
                            </p>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="mt-4 flex items-center justify-between rounded-xl bg-secondary px-4 py-3.5">
                      <span className="text-[14px] font-bold text-secondary-foreground">할인율</span>
                      <span className="text-[18px] font-extrabold text-primary">
                        {rate !== null && saleNum < original ? `${rate}%` : '—'}
                      </span>
                    </div>
                  </div>
                )}

                {/* STEP 3 — 픽업 마감 시각 */}
                {step === 3 && (
                  <div>
                    <h2 className="text-[21px] font-extrabold leading-snug tracking-tight text-foreground">
                      픽업 마감 시간을
                      <br />
                      설정해 주세요
                    </h2>
                    <p className="mb-6 mt-2 text-sm leading-relaxed text-muted-foreground">
                      이 시간까지 고객이 매장에서 픽업할 수 있어요.
                    </p>

                    <FormField
                      control={form.control}
                      name="closeTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            픽업 마감 시각<span className="ml-0.5 text-primary">*</span>
                          </FormLabel>
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
                  </div>
                )}

                {/* STEP 4 — 확인 */}
                {step === 4 && (
                  <div>
                    <h2 className="text-[21px] font-extrabold leading-snug tracking-tight text-foreground">
                      입력 내용을
                      <br />
                      확인해 주세요
                    </h2>
                    <p className="mb-6 mt-2 text-sm leading-relaxed text-muted-foreground">
                      등록하면 고객 앱에 바로 노출돼요.
                    </p>

                    <dl className="overflow-hidden rounded-[14px] border border-border">
                      {[
                        { k: '상품', val: selected?.name ?? '—' },
                        { k: '정상가', val: won(original) },
                        { k: '마감 할인 수량', val: `${Number(v.totalQty || '0')}개` },
                        {
                          k: '할인가',
                          val: `${won(saleNum)}${rate !== null ? ` (${rate}%↓)` : ''}`,
                        },
                        { k: '픽업 마감', val: v.closeTime },
                      ].map((row, i) => (
                        <div
                          key={row.k}
                          className={cn(
                            'flex items-center justify-between px-4 py-3.5',
                            i > 0 && 'border-t border-border',
                          )}
                        >
                          <dt className="text-[13.5px] text-muted-foreground">{row.k}</dt>
                          <dd className="text-[14px] font-bold text-foreground">{row.val}</dd>
                        </div>
                      ))}
                    </dl>

                    {serverError && (
                      <p role="alert" className="mt-4 text-[13px] font-medium text-destructive">
                        {serverError}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* CTA */}
              <div className="shrink-0 border-t border-border bg-card px-5 py-3">
                <div className="flex gap-2.5">
                  <button
                    type="button"
                    onClick={goPrev}
                    className="h-[54px] w-24 shrink-0 rounded-xl bg-background text-base font-bold tracking-[-0.3px] text-muted-foreground transition active:scale-[0.98]"
                  >
                    {step === 1 ? '취소' : '이전'}
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    disabled={!stepValid || (step === TOTAL && create.isPending)}
                    className="h-[54px] flex-1 rounded-xl bg-primary text-base font-bold tracking-[-0.3px] text-white transition active:scale-[0.98] disabled:bg-[#f0d9ce] disabled:active:scale-100"
                  >
                    {step < TOTAL ? '다음' : create.isPending ? '등록 중…' : '마감 할인 등록'}
                  </button>
                </div>
              </div>
            </form>
          </Form>
        </>
      )}
    </main>
  )
}
