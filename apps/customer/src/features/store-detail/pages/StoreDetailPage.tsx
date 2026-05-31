import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router'
import { ComingSoonProvider } from '@/shared/components/ComingSoonToast'
import { ScreenContainer } from '@/shared/components/ScreenContainer'
import { useComingSoon } from '@/shared/hooks/useComingSoon'
import { PullToRefresh } from '@/shared/components/PullToRefresh'
import { Button } from '@/shared/components/ui/button'
import { ROUTES } from '@/shared/lib/routes'
import { storeDetailParamsSchema } from '../types'
import { useStoreDetail } from '../hooks/useStoreDetail'
import { useStoreDetailRefresh } from '../hooks/useStoreDetailRefresh'
import { useToggleFavorite } from '@/features/favorites/hooks/useToggleFavorite'
import { favoriteErrorMessage } from '@/features/favorites/lib/favoriteErrorMessage'
import { StoreHero } from '../components/StoreHero'
import { StoreHeadMeta } from '../components/StoreHeadMeta'
import { StoreActions } from '../components/StoreActions'
import { StoreTabs } from '../components/StoreTabs'
import type { StoreTabKey } from '../lib/tabs'
import { DealTab } from '../components/DealTab'
import { MenuTab } from '../components/MenuTab'
import { ReviewTab } from '../components/ReviewTab'
import { InfoTab } from '../components/InfoTab'
import { CartBar } from '../components/CartBar'
import { TabLoading } from '../components/TabStates'

/** 매장 상세 — 라우트 파라미터 검증 후 ComingSoon Provider 안에서 본문 렌더 */
export function StoreDetailPage() {
  const params = useParams()
  const parsed = storeDetailParamsSchema.safeParse(params)
  if (!parsed.success) return <Navigate to={ROUTES.HOME} replace />

  return (
    <ComingSoonProvider>
      <StoreDetailView key={parsed.data.id} storeId={parsed.data.id} />
    </ComingSoonProvider>
  )
}

function StoreDetailView({ storeId }: { storeId: string }) {
  const navigate = useNavigate()
  const { show } = useComingSoon()
  const { data: store, isPending, isError } = useStoreDetail(storeId)
  const refresh = useStoreDetailRefresh(storeId)
  const toggleFavorite = useToggleFavorite()
  const [activeTab, setActiveTab] = useState<StoreTabKey>('deal')

  const handleBack = () => navigate(-1)

  const handleShare = async () => {
    const url = window.location.href
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: store?.name, url })
      } catch {
        /* 사용자가 공유 시트를 닫음 — 무시 */
      }
      return
    }
    try {
      await navigator.clipboard.writeText(url)
      show('매장 링크를 복사했어요.')
    } catch {
      show('공유를 지원하지 않는 환경이에요.')
    }
  }

  const handleToggleFavorite = () => {
    if (!store) return
    toggleFavorite.mutate(
      {
        storeId,
        next: !store.isFavorite,
        // 단골 목록 카드가 상세에서 본 매장과 일치하도록 카드 전달 (활성 떨이 수는 BE 전까지 0)
        store: {
          id: store.id,
          name: store.name,
          imageUrl: store.imageUrl,
          distanceKm: store.distanceKm,
          rating: store.rating,
          activeDealCount: 0,
        },
      },
      { onError: (err) => show(favoriteErrorMessage(err)) },
    )
  }

  if (isPending) {
    return (
      <ScreenContainer variant="bleed">
        <div className="relative h-[218px] flex-shrink-0 animate-pulse bg-muted">
          <button
            type="button"
            aria-label="뒤로 가기"
            onClick={handleBack}
            className="absolute left-[10px] top-[calc(env(safe-area-inset-top,0px)+8px)] flex size-11 items-center justify-center rounded-full bg-white/95 text-foreground shadow-[0_2px_8px_rgba(0,0,0,0.16)]"
          >
            ‹
          </button>
        </div>
        <TabLoading />
      </ScreenContainer>
    )
  }

  if (isError || !store) {
    return (
      <ScreenContainer variant="bleed" className="flex flex-col items-center justify-center gap-4 px-8 text-center">
        <p className="text-sm text-muted-foreground">매장 정보를 불러오지 못했어요.</p>
        <Button variant="outline" onClick={handleBack}>
          뒤로 가기
        </Button>
      </ScreenContainer>
    )
  }

  return (
    <>
      <PullToRefresh onRefresh={refresh}>
        <ScreenContainer variant="bleed" className="pb-[96px]">
          <StoreHero
            imageUrl={store.imageUrl}
            isFavorite={store.isFavorite}
            favoritePending={toggleFavorite.isPending}
            onBack={handleBack}
            onShare={handleShare}
            onToggleFavorite={handleToggleFavorite}
          />
          <StoreHeadMeta store={store} />
          <StoreActions
            phone={store.phone}
            onMap={() => navigate(ROUTES.STORE_LOCATION(storeId))}
            onShare={handleShare}
          />
          <StoreTabs active={activeTab} onSelect={setActiveTab} />
          <div>
            {activeTab === 'deal' && (
              <DealTab storeId={storeId} businessStatus={store.businessStatus} />
            )}
            {activeTab === 'menu' && (
              <MenuTab storeId={storeId} businessStatus={store.businessStatus} />
            )}
            {activeTab === 'review' && <ReviewTab storeId={storeId} />}
            {activeTab === 'info' && <InfoTab store={store} />}
          </div>
        </ScreenContainer>
      </PullToRefresh>
      <CartBar count={0} />
    </>
  )
}
