import { useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import { cn } from '@/shared/lib/utils'
import { ROUTES } from '@/shared/lib/routes'
import { useCurrentStoreStore } from '@/features/store/stores/currentStoreStore'
import { useProducts } from '../hooks/useProducts'
import { ProductCard } from '../components/ProductCard'
import { PRODUCT_CATEGORIES } from '../types'
import type { ProductCategory } from '../types'

type CategoryFilter = ProductCategory | 'all'

const FILTERS: { value: CategoryFilter; label: string }[] = [
  { value: 'all', label: '전체' },
  ...PRODUCT_CATEGORIES.map((c) => ({ value: c, label: c })),
]

/**
 * 상품 관리 — 현재 매장의 일반 상품 목록(읽기전용) + 등록 진입.
 * 수정/삭제/판매 토글은 별도 '일반 상품 수정/삭제' 기능. 마감할인 탭은 범위 외.
 */
export function ProductListPage() {
  const navigate = useNavigate()
  const storeId = useCurrentStoreStore((s) => s.selectedStoreId)
  const { data: products, isLoading } = useProducts(storeId)
  const [filter, setFilter] = useState<CategoryFilter>('all')

  const visible = (products ?? []).filter((p) => filter === 'all' || p.category === filter)
  const isEmpty = !isLoading && visible.length === 0

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-background pb-10">
      <header className="sticky top-0 z-10 flex h-[52px] items-center gap-1 border-b border-border bg-card px-2">
        <button
          type="button"
          aria-label="뒤로 가기"
          onClick={() => navigate(ROUTES.HOME)}
          className="flex size-10 items-center justify-center rounded-full text-foreground active:bg-muted"
        >
          <ChevronLeft className="size-[22px]" />
        </button>
        <h1 className="text-[16px] font-bold">상품 관리</h1>
      </header>

      <Link
        to={ROUTES.PRODUCT_NEW}
        className="mx-5 mt-4 mb-1 flex h-12 items-center justify-center gap-1.5 rounded-[12px] border-[1.5px] border-dashed border-primary text-[14px] font-bold text-primary transition active:bg-secondary"
      >
        <span aria-hidden>➕</span> 상품 등록하기
      </Link>

      {/* 카테고리 필터 */}
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

      {/* 목록 */}
      <div className="mt-2 flex flex-col gap-2 px-5">
        {isLoading && (
          <p className="py-16 text-center text-[14px] text-muted-foreground">불러오는 중…</p>
        )}

        {isEmpty && (
          <div className="px-8 py-16 text-center">
            <p className="text-[40px]">🍞</p>
            <p className="mt-3 whitespace-pre-line text-[14px] leading-relaxed text-muted-foreground">
              {(products?.length ?? 0) === 0
                ? '아직 등록된 상품이 없어요.\n첫 상품을 등록해 보세요.'
                : '이 카테고리에는 상품이 없어요.'}
            </p>
          </div>
        )}

        {visible.map((p) => (
          <ProductCard
            key={p.id}
            name={p.name}
            category={p.category}
            price={p.price}
            imageUrl={p.imageUrl}
            status={p.onSale ? 'onSale' : 'offSale'}
          />
        ))}
      </div>
    </div>
  )
}
