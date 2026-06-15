import { useEffect, useRef } from 'react'
import { Bell, Store } from 'lucide-react'
import { Link, useSearchParams } from 'react-router'
import { ScreenContainer } from '@/shared/components/ScreenContainer'
import { EmptyState } from '@/shared/components/EmptyState'
import { ErrorState } from '@/shared/components/ErrorState'
import { ListRowSkeleton } from '@/shared/components/Skeletons'
import { ROUTES } from '@/shared/lib/routes'
import { useUnreadCount } from '@/features/notifications/hooks/useUnreadCount'
import { SearchBarButton } from '@/shared/components/SearchBarButton'
import { PullToRefresh } from '@/shared/components/PullToRefresh'
import { StoreSortTabs } from '../components/StoreSortTabs'
import { StoreListCard } from '../components/StoreListCard'
import { useStoreList } from '../hooks/useStoreList'
import { useStoreListRefresh } from '../hooks/useStoreListRefresh'
import { storeListParamsSchema, type StoreSort } from '../types'

/** 알림센터 진입 — 홈 헤더와 동일하게 미읽음 수 뱃지 표시 (소비자 알림 #11 연동 완료). */
function NotificationBell() {
  const { data: unreadCount = 0 } = useUnreadCount()
  return (
    <Link
      to={ROUTES.NOTIFICATIONS}
      aria-label="알림"
      className="relative -mr-2 inline-flex size-11 items-center justify-center text-foreground"
    >
      <Bell className="size-[22px]" aria-hidden />
      {unreadCount > 0 && (
        <span
          className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-white"
          aria-hidden
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Link>
  )
}

function StoreListBody({
  sort,
  onSortChange,
}: {
  sort: StoreSort
  onSortChange: (next: StoreSort) => void
}) {
  const { data, isPending, isError, hasNextPage, isFetchingNextPage, fetchNextPage, refetch } =
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
          <ListRowSkeleton className="py-2" />
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : items.length === 0 ? (
          <EmptyState icon={<Store />}>주변 5km에 둘러볼 매장이 없어요.</EmptyState>
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
    <ScreenContainer as="section" variant="tab">
      <header className="flex h-[52px] flex-shrink-0 items-center justify-between px-5">
        <h1 className="text-lg font-extrabold tracking-[-0.3px]">전체 매장</h1>
        <NotificationBell />
      </header>
      <PullToRefresh onRefresh={refresh}>
        <StoreListBody sort={sort} onSortChange={(next) => setSearchParams({ sort: next })} />
      </PullToRefresh>
    </ScreenContainer>
  )
}
