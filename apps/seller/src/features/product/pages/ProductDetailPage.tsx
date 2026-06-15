import { useState } from 'react'
import { z } from 'zod'
import { Link, Navigate, useNavigate, useParams } from 'react-router'
import { ChevronLeft, Pencil, ShoppingBag, Trash2, Utensils, Zap } from 'lucide-react'
import { ConfirmSheet } from '@/shared/components/ConfirmSheet'
import { ErrorState } from '@/shared/components/ErrorState'
import { cn } from '@/shared/lib/utils'
import { ROUTES } from '@/shared/lib/routes'
import { ApiError } from '@/shared/lib/apiError'
import { useCurrentStoreStore } from '@/features/store/stores/currentStoreStore'
import { useStoreStatus } from '@/features/store/hooks/useStoreStatus'
import { useClearances } from '@/features/clearance/hooks/useClearances'
import { DealCard } from '@/features/clearance/components/DealCard'
import { toDealCardStatus } from '@/features/clearance/lib/clearanceStatus'
import { useProduct } from '../hooks/useProduct'
import { useDeleteProduct } from '../hooks/useDeleteProduct'
import { CATEGORY_LABELS } from '../types'

const paramsSchema = z.object({ id: z.coerce.number().int().positive() })
const won = (n: number) => `₩${n.toLocaleString('ko-KR')}`

const DELETE_BLOCKED_MSG =
  '진행 중인 마감 할인이 있어 삭제할 수 없어요. 먼저 마감 할인을 마감해 주세요.'

/**
 * 상품 상세 — 정보 + 이 상품의 마감 할인 + 떨이 전환/수정/삭제 진입 (노션: 일반 상품 수정/삭제, 프로토타입 34-product-detail).
 * 떨이 전환 CTA 는 판매중·활성 떨이 없음·영업중일 때만 활성(아니면 사유 표시).
 */
export function ProductDetailPage() {
  const navigate = useNavigate()
  const params = useParams()
  const parsed = paramsSchema.safeParse(params)
  const id = parsed.success ? parsed.data.id : 0
  const selectedStoreId = useCurrentStoreStore((s) => s.selectedStoreId)

  const { data: product, isLoading, isError, refetch } = useProduct(selectedStoreId, id)
  const { data: clearances } = useClearances(selectedStoreId)
  const { data: status } = useStoreStatus(selectedStoreId)
  const del = useDeleteProduct(id, selectedStoreId)

  const [sheetOpen, setSheetOpen] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  if (!parsed.success) return <Navigate to={ROUTES.HOME} replace />

  const productClearances = (clearances ?? []).filter((c) => c.productId === id)
  const hasActiveClearance = productClearances.some((c) => c.status === 'OPEN')

  // 떨이 전환 CTA 게이팅 사유 (null = 활성)
  const dealReason = !product
    ? '상품을 불러오는 중이에요'
    : !product.onSale
      ? '판매 중인 상품만 마감 할인으로 등록할 수 있어요'
      : hasActiveClearance
        ? '이미 진행 중인 마감 할인이 있어요'
        : status && status.operationStatus !== 'OPEN'
          ? '영업 중일 때만 마감 할인을 등록할 수 있어요'
          : null

  const onConfirmDelete = () => {
    setServerError(null)
    del.mutate(undefined, {
      onSuccess: () => navigate(ROUTES.PRODUCTS),
      onError: (e) => {
        setSheetOpen(false)
        setServerError(
          e instanceof ApiError && e.status === 409
            ? DELETE_BLOCKED_MSG
            : '삭제 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요.',
        )
      },
    })
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
        <h1 className="text-[16px] font-bold">상품 상세</h1>
      </header>

      {isLoading && (
        <p className="py-16 text-center text-[14px] text-muted-foreground">불러오는 중…</p>
      )}

      {!isLoading && (isError || !product) && (
        <ErrorState icon={<ShoppingBag />} onRetry={() => refetch()}>
          상품을 찾을 수 없어요.
        </ErrorState>
      )}

      {product && (
        <>
          <div className="flex flex-col gap-3 px-5 pt-4">
            {/* 헤드 카드 (프로토타입 dd-head — 테두리 카드) */}
            <div className="flex items-center gap-3.5 rounded-[16px] border border-border bg-card px-[18px] py-4">
              <span className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-[14px] bg-cream text-[28px]">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="size-full object-cover" />
                ) : (
                  <Utensils className="size-7 text-muted-foreground" />
                )}
              </span>
              <div className="flex min-w-0 flex-col items-start gap-1.5">
                <p className="truncate text-[17px] font-extrabold text-foreground">{product.name}</p>
                <span
                  className={cn(
                    'inline-block rounded-lg px-2 py-0.5 text-[11px] font-bold',
                    product.onSale ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground',
                  )}
                >
                  {product.onSale ? '판매중' : '판매중지'}
                </span>
              </div>
            </div>

            {/* 상품 정보 */}
            <section className="rounded-[14px] border border-border bg-card p-4">
              <p className="mb-2 text-[13px] font-bold text-foreground">상품 정보</p>
              <dl className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <dt className="text-[13px] text-muted-foreground">카테고리</dt>
                  <dd className="text-[14px] font-semibold text-foreground">
                    {CATEGORY_LABELS[product.category] ?? product.category}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-[13px] text-muted-foreground">정상가</dt>
                  <dd className="text-[14px] font-extrabold text-foreground">{won(product.price)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-[13px] text-muted-foreground">판매 상태</dt>
                  <dd className="text-[14px] font-semibold text-foreground">
                    {product.onSale ? '판매중' : '판매중지'}
                  </dd>
                </div>
                {product.description && (
                  <div className="border-t border-border pt-2.5">
                    <dt className="mb-1 text-[13px] text-muted-foreground">상품 설명</dt>
                    <dd className="text-[13.5px] leading-relaxed text-foreground">
                      {product.description}
                    </dd>
                  </div>
                )}
              </dl>
            </section>

            {/* 이 상품의 마감 할인 */}
            <section>
              <h2 className="mb-2 text-[13px] font-bold text-muted-foreground">
                이 상품의 마감 할인
              </h2>
              {productClearances.length === 0 ? (
                <p className="rounded-[14px] border border-dashed border-border bg-card px-4 py-6 text-center text-[13px] text-muted-foreground">
                  진행 중인 마감 할인이 없어요.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {productClearances.map((c) => (
                    <Link
                      key={c.id}
                      to={ROUTES.CLEARANCE_DETAIL(c.id)}
                      className={cn('block', c.status !== 'OPEN' && 'opacity-60')}
                    >
                      <DealCard
                        name={c.productName}
                        imageUrl={c.productImageUrl}
                        originalPrice={c.originalPrice}
                        salePrice={c.salePrice}
                        soldCount={c.soldQty}
                        totalQty={c.totalQty}
                        closeTime={c.closeTime}
                        status={toDealCardStatus(c.status)}
                      />
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* CTA — 내용 흐름 배치(하단 고정 X, 중간 빈공간 방지) */}
          <div className="mt-8 flex flex-col gap-2.5 px-5">
            {dealReason ? (
              <div>
                <button
                  type="button"
                  disabled
                  className="flex h-[54px] w-full items-center justify-center gap-1.5 rounded-xl bg-primary-disabled text-base font-bold text-white"
                >
                  <Zap className="size-[18px]" /> 이 상품으로 마감 할인 등록
                </button>
                <p className="mt-1.5 text-center text-[12px] text-muted-foreground">{dealReason}</p>
              </div>
            ) : (
              <Link
                to={`${ROUTES.CLEARANCE_NEW}?productId=${product.id}`}
                className="flex h-[54px] w-full items-center justify-center gap-1.5 rounded-xl bg-primary text-base font-bold tracking-[-0.3px] text-white transition active:scale-[0.98]"
              >
                <Zap className="size-[18px]" /> 이 상품으로 마감 할인 등록
              </Link>
            )}

            <div className="flex gap-2.5">
              <Link
                to={ROUTES.PRODUCT_EDIT(product.id)}
                className="flex h-[52px] flex-1 items-center justify-center gap-1.5 rounded-xl bg-background text-[15px] font-bold text-foreground transition active:scale-[0.98]"
              >
                <Pencil className="size-[17px]" /> 상품 수정
              </Link>
              {hasActiveClearance ? (
                <button
                  type="button"
                  disabled
                  className="flex h-[52px] flex-1 cursor-not-allowed items-center justify-center gap-1.5 rounded-xl bg-background text-[15px] font-bold text-muted-foreground opacity-50"
                >
                  <Trash2 className="size-[17px]" /> 상품 삭제
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setSheetOpen(true)}
                  className="flex h-[52px] flex-1 items-center justify-center gap-1.5 rounded-xl bg-background text-[15px] font-bold text-destructive transition active:scale-[0.98]"
                >
                  <Trash2 className="size-[17px]" /> 상품 삭제
                </button>
              )}
            </div>
            {hasActiveClearance && (
              <p className="text-center text-[12px] text-muted-foreground">{DELETE_BLOCKED_MSG}</p>
            )}
            {!hasActiveClearance && serverError && (
              <p role="alert" className="text-center text-[12px] text-destructive">
                {serverError}
              </p>
            )}
          </div>
        </>
      )}

      <ConfirmSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        title="이 상품을 삭제할까요?"
        description="삭제한 상품은 복구할 수 없어요."
        confirmLabel={del.isPending ? '삭제 중…' : '삭제'}
        onConfirm={onConfirmDelete}
        variant="danger"
        isPending={del.isPending}
      />
    </div>
  )
}
