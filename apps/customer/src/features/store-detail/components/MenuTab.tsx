import { cn } from '@/shared/lib/utils'
import { useStoreMenu } from '../hooks/useStoreMenu'
import { isOrderable } from '../lib/businessStatus'
import type { BusinessStatus, StoreMenuItem } from '../types'
import { MenuItem } from './MenuItem'
import { TabEmpty, TabLoading, OffBusinessNotice } from './TabStates'

/** 카테고리 등장 순서를 보존하며 그룹화 */
function groupByCategory(items: StoreMenuItem[]): [string, StoreMenuItem[]][] {
  const map = new Map<string, StoreMenuItem[]>()
  for (const item of items) {
    const list = map.get(item.category) ?? []
    list.push(item)
    map.set(item.category, list)
  }
  return [...map.entries()]
}

/** 메뉴 탭 — 판매 ON 일반 상품을 카테고리별로 그룹화 노출 */
export function MenuTab({
  storeId,
  businessStatus,
}: {
  storeId: string
  businessStatus: BusinessStatus
}) {
  const { data, isPending, isError } = useStoreMenu(storeId)
  const orderable = isOrderable(businessStatus)

  if (isPending) return <TabLoading />
  if (isError) return <TabEmpty>메뉴 정보를 불러오지 못했어요.</TabEmpty>
  if (data.length === 0) return <TabEmpty>등록된 메뉴가 없어요.</TabEmpty>

  const groups = groupByCategory(data)

  return (
    <div className="pb-1">
      {!orderable && <OffBusinessNotice />}
      {groups.map(([category, items], idx) => (
        <section key={category} className="mt-1">
          <div
            className={cn(
              'flex items-center gap-2 border-y border-border bg-background px-5 pb-2 pt-[14px]',
              idx === 0 && 'border-t-0',
            )}
          >
            <h3 className="flex-1 text-[13.5px] font-extrabold tracking-[-0.3px]">{category}</h3>
            <span className="rounded-full border border-border bg-card px-2 py-0.5 text-[11.5px] font-bold text-muted-foreground">
              {items.length}
            </span>
          </div>
          <div className="px-5">
            {items.map((item) => (
              <MenuItem key={item.id} item={item} orderable={orderable} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
