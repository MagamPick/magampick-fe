import { ComingSoonProvider } from '@/shared/components/ComingSoonToast'
import { ScreenContainer } from '@/shared/components/ScreenContainer'
import { HomeHeader } from '../components/HomeHeader'
import { SearchBarButton } from '../components/SearchBarButton'
import { ClosingDealsSection } from '../components/ClosingDealsSection'
import { FavoriteStoresSection } from '../components/FavoriteStoresSection'
import { NeighborhoodSection } from '../components/NeighborhoodSection'
import { PullToRefresh } from '@/shared/components/PullToRefresh'
import { useHomeRefresh } from '../hooks/useHomeRefresh'

/** 소비자 홈 피드 — 주소지 기준 3섹션(마감임박·단골·동네). 탭 셸의 index 라우트(/). */
function HomeFeed() {
  const refresh = useHomeRefresh()
  return (
    <PullToRefresh onRefresh={refresh}>
      <SearchBarButton />
      <ClosingDealsSection />
      <FavoriteStoresSection />
      <NeighborhoodSection />
    </PullToRefresh>
  )
}

export function HomePage() {
  return (
    <ComingSoonProvider>
      <ScreenContainer variant="tab">
        <HomeHeader />
        <HomeFeed />
      </ScreenContainer>
    </ComingSoonProvider>
  )
}
