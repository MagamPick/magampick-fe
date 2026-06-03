import { useStoreDeals } from '../hooks/useStoreDeals'
import { isOrderable } from '../lib/businessStatus'
import type { BusinessStatus } from '../types'
import { DealItem } from './DealItem'
import { TabEmpty, TabLoading, OffBusinessNotice } from './TabStates'

/** 마감 할인 탭 — 안내 배너 + 활성 떨이 목록 (실시간 카운트다운) */
export function DealTab({
  storeId,
  businessStatus,
}: {
  storeId: string
  businessStatus: BusinessStatus
}) {
  const { data, isPending, isError } = useStoreDeals(storeId)
  const orderable = isOrderable(businessStatus)

  if (isPending) return <TabLoading />
  if (isError) return <TabEmpty>떨이 정보를 불러오지 못했어요.</TabEmpty>
  if (data.length === 0) return <TabEmpty>지금 진행 중인 마감 할인이 없어요.</TabEmpty>

  return (
    <div>
      <p className="mx-5 mt-4 rounded-[12px] bg-secondary px-4 py-[14px] text-[13px] font-bold text-secondary-foreground">
        🎉 지금 바로 픽업 가능한 마감 할인이에요
      </p>
      {!orderable && <OffBusinessNotice />}
      <div className="px-5 pt-1">
        {data.map((deal) => (
          <DealItem key={deal.id} deal={deal} orderable={orderable} />
        ))}
      </div>
    </div>
  )
}
