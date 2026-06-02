import { useNavigate } from 'react-router'
import { ChevronLeft } from 'lucide-react'
import { ScreenContainer } from '@/shared/components/ScreenContainer'
import { EmptyState } from '@/shared/components/EmptyState'
import { useEvents } from '../hooks/useEvents'
import { useClaimEvent } from '../hooks/useClaimEvent'
import { EventCard } from '../components/EventCard'

/**
 * 이벤트 — 쿠폰 받기 (노션 「쿠폰 발급」 소비자 다운로드, 프로토타입 57-events).
 * 진행 중 이벤트 쿠폰을 [받기]로 쿠폰함에 담는다(1인 1회). 마이/쿠폰함에서 진입.
 */
export function EventPage() {
  const navigate = useNavigate()
  const { data: events, isLoading } = useEvents()
  const claim = useClaimEvent()

  const handleClaim = (id: string) => {
    if (claim.isPending) return
    claim.mutate(id)
  }

  return (
    <ScreenContainer variant="page">
      <header className="sticky top-0 z-10 flex h-[52px] items-center gap-1 border-b border-border bg-card px-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="뒤로 가기"
          className="flex size-10 items-center justify-center text-foreground"
        >
          <ChevronLeft className="size-[22px]" />
        </button>
        <h1 className="text-[17px] font-bold text-foreground">이벤트</h1>
      </header>

      <main className="flex-1 pb-6">
        <div className="mx-5 mb-1.5 mt-3.5 flex items-center gap-3 rounded-[14px] border border-[#FFD9BD] bg-gradient-to-br from-[#FFF6EE] to-[#FFE7D6] px-4 py-3.5">
          <span className="text-[28px] leading-none" aria-hidden>
            🎁
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-extrabold text-foreground">진행 중인 쿠폰 이벤트</div>
            <div className="mt-0.5 text-xs leading-[1.45] text-muted-foreground">
              마음에 드는 쿠폰을 받아 쿠폰함에 담아보세요.
            </div>
          </div>
        </div>

        {isLoading ? (
          <p className="py-16 text-center text-sm text-muted-foreground">불러오는 중…</p>
        ) : events && events.length > 0 ? (
          <div className="flex flex-col gap-2.5 px-5 pb-6 pt-1.5">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onClaim={handleClaim}
                claiming={claim.isPending && claim.variables === event.id}
              />
            ))}
          </div>
        ) : (
          <EmptyState icon="🎉">진행 중인 이벤트가 없어요.</EmptyState>
        )}
      </main>
    </ScreenContainer>
  )
}
