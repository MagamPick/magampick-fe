import { useEffect, useRef } from 'react'
import { Bell } from 'lucide-react'
import { useSearchParams } from 'react-router'
import { ComingSoonProvider } from '@/shared/components/ComingSoonToast'
import { useComingSoon } from '@/shared/hooks/useComingSoon'
import { SearchBarButton } from '@/shared/components/SearchBarButton'
import { PullToRefresh } from '@/shared/components/PullToRefresh'
import { StoreSortTabs } from '../components/StoreSortTabs'
import { StoreListCard } from '../components/StoreListCard'
import { useStoreList } from '../hooks/useStoreList'
import { useStoreListRefresh } from '../hooks/useStoreListRefresh'
import { storeListParamsSchema, type StoreSort } from '../types'

/** 미구현 알림(Phase 후순위) 진입 — 탭 시 "준비 중" 안내. 카운트 배지는 알림 기능 생기면. */
function NotificationBell() {
  const { show } = useComingSoon()
  return (
    <button
      type="button"
      aria-label="알림"
      onClick={() => show('알림은 준비 중이에요.')}
      className="-mr-2 inline-flex size-11 items-center justify-center text-foreground"
    >
      <Bell className="size-[22px]" aria-hidden />
    </button>
  )
}

function ListSkeleton() {
  return (
    <div>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3 border-b border-border py-[13px]">
          <div className="size-16 flex-shrink-0 animate-pulse rounded-[12px] bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-1/2 animate-pulse rounded bg-muted" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  )
}

function StoreListBody({
  sort,
  onSortChange,
}: {
  sort: StoreSort
  onSortChange: (next: StoreSort) => void
}) {
  const { data, isPending, isError, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useStoreList(sort)
  const sentinelRef = useRef<HTMLDivElement>(null)

  // 무한 스크롤 — sentinel 이 보이면 다음 페이지 자동 로드 (ReviewTab 과 동일 패턴)
  useEffect(() => {
    const el = sentinelRef.current
    if (!el || typeof IntersectionObserver === 'undefined' || !hasNextPage) return
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !isFetchingNextPage) fetchNextPage()
    })
    io.observe(el)
    return () => io.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const items = data?.pages.flatMap((p) => p.items) ?? []
  const total = data?.pages[0]?.total ?? 0
  const dealStoreCount = data?.pages[0]?.dealStoreCount ?? 0

  return (
    <>
      <SearchBarButton />
      <StoreSortTabs value={sort} onChange={onSortChange} />
      <div className="px-5">
        {isPending ? (
          <ListSkeleton />
        ) : isError ? (
          <p className="px-1 py-5 text-sm font-medium text-muted-foreground">
            지금은 불러오지 못했어요. 잠시 후 다시 시도해주세요.
          </p>
        ) : items.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <div className="text-[44px]">🏪</div>
            <p className="mt-3 text-sm font-semibold text-muted-foreground">
              주변 5km에 둘러볼 매장이 없어요.
            </p>
          </div>
        ) : (
          <>
            <p className="px-1 pb-2 pt-1 text-[13px] font-semibold text-muted-foreground">
              전체 <b className="text-primary">{total}곳</b> · 마감 할인 진행{' '}
              <b className="text-primary">{dealStoreCount}곳</b>
            </p>
            <div>
              {items.map((store) => (
                <StoreListCard key={store.id} store={store} />
              ))}
            </div>
            {hasNextPage ? (
              <div ref={sentinelRef} className="py-4 text-center text-xs text-muted-foreground">
                {isFetchingNextPage ? '불러오는 중…' : ' '}
              </div>
            ) : (
              <p className="py-5 text-center text-xs text-muted-foreground">
                더 이상 매장이 없어요
              </p>
            )}
          </>
        )}
      </div>
    </>
  )
}

/**
 * 전체 매장 조회 (소비자) — 탭 셸 `/all`. 5km 이내 매장 전체를 정렬 5종으로 무한 스크롤.
 * 정렬은 URL `?sort=` (새로고침·공유·홈 딥링크 유지). 노션: 전체 매장 조회 (소비자).
 */
export function StoreListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { sort } = storeListParamsSchema.parse(Object.fromEntries(searchParams))
  const refresh = useStoreListRefresh()

  return (
    <ComingSoonProvider>
      <section className="flex flex-1 flex-col bg-card">
        <header className="flex h-[52px] flex-shrink-0 items-center justify-between px-5">
          <h1 className="text-lg font-extrabold tracking-[-0.3px]">전체 매장</h1>
          <NotificationBell />
        </header>
        <PullToRefresh onRefresh={refresh}>
          <StoreListBody sort={sort} onSortChange={(next) => setSearchParams({ sort: next })} />
        </PullToRefresh>
      </section>
    </ComingSoonProvider>
  )
}
