import { Search } from 'lucide-react'
import { EmptyState } from '@/shared/components/EmptyState'
import { StoreListCard } from '@/features/store-list/components/StoreListCard'
import { StoreSortTabs } from '@/features/store-list/components/StoreSortTabs'
import type { StoreSort } from '@/features/store-list/types'
import type { SearchResult } from '../types'
import { ProductResultRow } from './ProductResultRow'

interface SearchResultsProps {
  result: SearchResult
  sort: StoreSort
  onSortChange: (sort: StoreSort) => void
}

/**
 * 키워드 검색 결과 — 정렬 칩(매장·상품 동시 적용) + 매장 섹션(먼저) + 상품 섹션.
 * 각 섹션은 직접 매칭만, 개수 표시. 한 섹션 0건이면 생략, 둘 다 0건이면 "검색 결과 없음".
 */
export function SearchResults({ result, sort, onSortChange }: SearchResultsProps) {
  const { stores, products } = result

  if (stores.length === 0 && products.length === 0) {
    return (
      <EmptyState icon={<Search />}>
        검색 결과가 없어요.
        <br />
        다른 키워드로 검색해 보세요.
      </EmptyState>
    )
  }

  return (
    <>
      <StoreSortTabs value={sort} onChange={onSortChange} />
      <div className="px-5 pb-4">
        {stores.length > 0 && (
          <section>
            <p className="px-1 pb-1 pt-3 text-[13px] font-semibold text-muted-foreground">
              매장 <b className="text-primary">{stores.length}</b>
            </p>
            <div>
              {stores.map((store) => (
                <StoreListCard key={store.id} store={store} />
              ))}
            </div>
          </section>
        )}
        {products.length > 0 && (
          <section>
            <p className="px-1 pb-1 pt-3 text-[13px] font-semibold text-muted-foreground">
              상품 <b className="text-primary">{products.length}</b>
            </p>
            <div>
              {products.map((product) => (
                <ProductResultRow key={`${product.kind}:${product.id}`} product={product} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  )
}
