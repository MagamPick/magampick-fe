import { Link } from 'react-router'
import { ROUTES } from '@/shared/lib/routes'
import { useCurrentStoreStore } from '@/features/store/stores/currentStoreStore'
import { useClearances } from '@/features/clearance/hooks/useClearances'
import { DealCard } from '@/features/clearance/components/DealCard'
import { toDealCardStatus } from '@/features/clearance/lib/clearanceStatus'

/** 진행중 마감 할인 요약 — 현재 매장의 활성 떨이 (탭 전체는 상품 관리 > 마감 할인) */
export function HomeDealList() {
  const _storeIdNum = useCurrentStoreStore((s) => s.selectedStoreId)
  // mock hook(string storeId) 전달용 변환 — Step 2 실연동 시 이전
  const storeId = _storeIdNum != null ? String(_storeIdNum) : ''
  const { data: clearances, isLoading } = useClearances(storeId)
  const live = (clearances ?? []).filter((c) => c.status === 'ACTIVE')

  return (
    <section className="mx-5 mt-6">
      <div className="mb-2.5 flex items-center justify-between">
        <h2 className="text-[15px] font-bold text-foreground">진행중 마감 할인</h2>
        <Link
          to={`${ROUTES.PRODUCTS}?tab=deal`}
          className="text-[12.5px] font-semibold text-muted-foreground"
        >
          모두 보기 ›
        </Link>
      </div>

      {isLoading ? (
        <p className="py-6 text-center text-[13px] text-muted-foreground">불러오는 중…</p>
      ) : live.length === 0 ? (
        <p className="rounded-[14px] border border-dashed border-border bg-card px-4 py-6 text-center text-[13px] text-muted-foreground">
          진행 중인 마감 할인이 없어요.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {live.map((c) => (
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
      )}
    </section>
  )
}
