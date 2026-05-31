import { useFavorites } from '../hooks/useFavorites'
import { FavoriteListCard } from '../components/FavoriteListCard'

/** 단골 탭 (TabLayout 자식 라우트 /favs) — 상단 통계 + 카드 리스트 + 빈 상태. 프로토타입 23-favs. */
export function FavoritesPage() {
  const { data, isPending, isError } = useFavorites()

  return (
    <section className="flex flex-1 flex-col bg-card">
      <header className="flex h-[52px] flex-shrink-0 items-center px-5">
        <h1 className="text-lg font-extrabold tracking-[-0.3px]">단골 가게</h1>
      </header>

      <div className="flex-1 px-5">
        {isPending ? (
          <div>
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3 border-b border-border py-[13px]">
                <div className="size-16 flex-shrink-0 animate-pulse rounded-[12px] bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-1/2 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <p className="px-1 py-5 text-sm font-medium text-muted-foreground">
            지금은 불러오지 못했어요. 잠시 후 다시 시도해주세요.
          </p>
        ) : data.stores.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <div className="text-[44px]">❤️</div>
            <p className="mt-3 text-sm font-semibold text-muted-foreground">
              단골 가게가 없어요.
              <br />
              매장 상세에서 ♡ 버튼을 눌러 단골로 등록해보세요.
            </p>
          </div>
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
    </section>
  )
}
