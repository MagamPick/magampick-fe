import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { cn } from '@/shared/lib/utils'
import { ROUTES } from '@/shared/lib/routes'
import { ScreenContainer } from '@/shared/components/ScreenContainer'
import { EmptyState } from '@/shared/components/EmptyState'
import { ErrorState } from '@/shared/components/ErrorState'
import { ListRowSkeleton } from '@/shared/components/Skeletons'
import { useCurrentStoreStore } from '@/features/store/stores/currentStoreStore'
import { useClearances } from '@/features/clearance/hooks/useClearances'
import { DealCard } from '@/features/clearance/components/DealCard'
import { toDealCardStatus } from '@/features/clearance/lib/clearanceStatus'
import { useProducts } from '../hooks/useProducts'
import { ProductCard } from '../components/ProductCard'
import { PRODUCT_CATEGORIES } from '../types'
import type { ProductCategory } from '../types'

type CategoryFilter = ProductCategory | 'all'
type Tab = 'normal' | 'deal'

const FILTERS: { value: CategoryFilter; label: string }[] = [
  { value: 'all', label: '전체' },
  ...PRODUCT_CATEGORIES.map((c) => ({ value: c, label: c })),
]

/**
 * 상품 관리 — 일반 상품 / 마감 할인 세그먼트 탭 (프로토타입 22-products).
 * - 일반 상품: 목록 + 카테고리 필터, 카드 탭 → 상세(수정/삭제·떨이 전환 진입).
 * - 마감 할인: 진행중 / 오늘 마감된 떨이 목록, 카드 탭 → 떨이 상세.
 * `?tab=deal` 로 마감 할인 탭을 바로 열 수 있다(홈 "모두 보기" 등).
 */
export function ProductListPage() {
  const _storeIdNum = useCurrentStoreStore((s) => s.selectedStoreId)
  // mock hook(string storeId) 전달용 변환 — Step 2 실연동 시 이전
  const storeId = _storeIdNum != null ? String(_storeIdNum) : ''
  const [searchParams, setSearchParams] = useSearchParams()
  const tab: Tab = searchParams.get('tab') === 'deal' ? 'deal' : 'normal'
  const setTab = (next: Tab) => setSearchParams(next === 'deal' ? { tab: 'deal' } : {}, { replace: true })

  const {
    data: products,
    isPending: loadingProducts,
    isError: productsError,
    refetch: refetchProducts,
  } = useProducts(storeId)
  const {
    data: clearances,
    isPending: loadingClearances,
    isError: clearancesError,
    refetch: refetchClearances,
  } = useClearances(storeId)

  const [filter, setFilter] = useState<CategoryFilter>('all')

  const activeProductIds = new Set(
    (clearances ?? []).filter((c) => c.status === 'ACTIVE').map((c) => c.productId),
  )
  const visibleProducts = (products ?? []).filter(
    (p) => filter === 'all' || p.category === filter,
  )
  const productsEmpty = !loadingProducts && !productsError && visibleProducts.length === 0

  const liveDeals = (clearances ?? []).filter((c) => c.status === 'ACTIVE')
  const endedDeals = (clearances ?? []).filter((c) => c.status !== 'ACTIVE')

  return (
    <ScreenContainer variant="tab">
      <header className="sticky top-0 z-10 flex h-[52px] items-center border-b border-border bg-card px-5">
        <h1 className="text-[16px] font-bold">상품 관리</h1>
      </header>

      {/* 세그먼트 탭 */}
      <div className="flex border-b border-border bg-card" role="tablist" aria-label="상품 종류">
        {(
          [
            { value: 'normal', label: '일반 상품' },
            { value: 'deal', label: '마감 할인' },
          ] as const
        ).map((t) => {
          const on = tab === t.value
          return (
            <button
              key={t.value}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setTab(t.value)}
              className={cn(
                'flex-1 border-b-2 py-3 text-[14px] transition',
                on
                  ? 'border-primary font-bold text-foreground'
                  : 'border-transparent font-semibold text-muted-foreground',
              )}
            >
              {t.label}
            </button>
          )
        })}
      </div>

      {/* 일반 상품 패널 */}
      {tab === 'normal' && (
        <>
          <Link
            to={ROUTES.PRODUCT_NEW}
            className="mx-5 mt-4 mb-1 flex h-12 items-center justify-center gap-1.5 rounded-[12px] border-[1.5px] border-dashed border-primary text-[14px] font-bold text-primary transition active:bg-secondary"
          >
            <span aria-hidden>➕</span> 상품 등록하기
          </Link>

          <div className="flex gap-1.5 overflow-x-auto px-5 pt-3 pb-1 [&::-webkit-scrollbar]:hidden">
            {FILTERS.map((f) => {
              const on = filter === f.value
              return (
                <button
                  key={f.value}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setFilter(f.value)}
                  className={cn(
                    'shrink-0 rounded-full border-[1.5px] px-4 py-2 text-[13px] transition',
                    on
                      ? 'border-primary bg-secondary font-bold text-secondary-foreground'
                      : 'border-border bg-card text-muted-foreground',
                  )}
                >
                  {f.label}
                </button>
              )
            })}
          </div>

          <div className="mt-2 flex flex-col gap-2 px-5">
            {loadingProducts && <ListRowSkeleton className="py-2" />}

            {!loadingProducts && productsError && (
              <ErrorState onRetry={() => refetchProducts()}>상품을 불러오지 못했어요.</ErrorState>
            )}

            {productsEmpty &&
              ((products?.length ?? 0) === 0 ? (
                <EmptyState icon="🍞">
                  아직 등록된 상품이 없어요.
                  <br />
                  첫 상품을 등록해 보세요.
                </EmptyState>
              ) : (
                <EmptyState icon="🍞">이 카테고리에는 상품이 없어요.</EmptyState>
              ))}

            {visibleProducts.map((p) => (
              <Link key={p.id} to={ROUTES.PRODUCT_DETAIL(p.id)} className="block">
                <ProductCard
                  name={p.name}
                  category={p.category}
                  price={p.price}
                  imageUrl={p.imageUrl}
                  status={p.onSale ? 'onSale' : 'offSale'}
                  hasDeal={activeProductIds.has(p.id)}
                />
              </Link>
            ))}
          </div>
        </>
      )}

      {/* 마감 할인 패널 */}
      {tab === 'deal' && (
        <>
          <Link
            to={ROUTES.CLEARANCE_NEW}
            className="mx-5 mt-4 mb-1 flex h-12 items-center justify-center gap-1.5 rounded-[12px] border-[1.5px] border-dashed border-primary text-[14px] font-bold text-primary transition active:bg-secondary"
          >
            <span aria-hidden>🔥</span> 마감 할인 등록하기
          </Link>

          {loadingClearances && <ListRowSkeleton className="py-2" />}

          {!loadingClearances && clearancesError && (
            <ErrorState onRetry={() => refetchClearances()}>
              마감 할인을 불러오지 못했어요.
            </ErrorState>
          )}

          {!loadingClearances &&
            !clearancesError &&
            liveDeals.length === 0 &&
            endedDeals.length === 0 && (
              <EmptyState icon="🔥">
                진행 중인 마감 할인이 없어요.
                <br />
                판매 중인 상품을 마감 할인으로 등록해 보세요.
              </EmptyState>
            )}

          {liveDeals.length > 0 && (
            <section className="mt-4 px-5">
              <h2 className="mb-2 text-[13px] font-bold text-muted-foreground">진행중 마감 할인</h2>
              <div className="flex flex-col gap-2">
                {liveDeals.map((c) => (
                  <Link key={c.id} to={ROUTES.CLEARANCE_DETAIL(c.id)} className="block">
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
            </section>
          )}

          {endedDeals.length > 0 && (
            <section className="mt-6 px-5">
              <h2 className="mb-2 text-[13px] font-bold text-muted-foreground">오늘 마감된 마감 할인</h2>
              <div className="flex flex-col gap-2">
                {endedDeals.map((c) => (
                  <Link key={c.id} to={ROUTES.CLEARANCE_DETAIL(c.id)} className="block opacity-60">
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
            </section>
          )}
        </>
      )}
    </ScreenContainer>
  )
}
