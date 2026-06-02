import { useFavorites } from '../hooks/useFavorites'
import { FavoriteListCard } from '../components/FavoriteListCard'
import { ScreenContainer } from '@/shared/components/ScreenContainer'
import { EmptyState } from '@/shared/components/EmptyState'
import { ErrorState } from '@/shared/components/ErrorState'
import { ListRowSkeleton } from '@/shared/components/Skeletons'

/** 단골 탭 (TabLayout 자식 라우트 /favs) — 상단 통계 + 카드 리스트 + 빈 상태. 프로토타입 23-favs. */
export function FavoritesPage() {
  const { data, isPending, isError, refetch } = useFavorites()

  return (
    <ScreenContainer as="section" variant="tab">
      <header className="flex h-[52px] flex-shrink-0 items-center px-5">
        <h1 className="text-lg font-extrabold tracking-[-0.3px]">단골 가게</h1>
      </header>

      <div className="flex-1 px-5">
        {isPending ? (
          <ListRowSkeleton className="py-2" />
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : data.stores.length === 0 ? (
          <EmptyState icon="❤️">
            단골 가게가 없어요.
            <br />
            매장 상세에서 ♡ 버튼을 눌러 단골로 등록해보세요.
          </EmptyState>
        ) : (
          <>
            <p className="px-1 pb-2 pt-1 text-[13px] font-semibold text-muted-foreground">
              단골 <b className="text-primary">{data.totalCount}곳</b> · 오늘 진행 중 마감 할인{' '}
              <b className="text-primary">{data.totalActiveDealCount}건</b>
            </p>
            <div>
              {data.stores.map((store) => (
                <FavoriteListCard key={store.id} store={store} />
              ))}
            </div>
          </>
        )}
      </div>
    </ScreenContainer>
  )
}
