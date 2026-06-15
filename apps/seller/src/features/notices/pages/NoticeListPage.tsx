import { useNavigate } from 'react-router'
import { ChevronLeft, Megaphone } from 'lucide-react'
import { ScreenContainer } from '@/shared/components/ScreenContainer'
import { EmptyState } from '@/shared/components/EmptyState'
import { ErrorState } from '@/shared/components/ErrorState'
import { ListRowSkeleton } from '@/shared/components/Skeletons'
import { useNotices } from '../hooks/useNotices'
import { NoticeAccordion } from '../components/NoticeAccordion'

/**
 * 공지사항 (노션 「공지사항 조회」, 프로토타입 61-notices).
 * 핀 우선·최신순 아코디언(소비자 통일). 마이페이지에서 진입(풀스크린, 바텀네비 없음).
 */
export function NoticeListPage() {
  const navigate = useNavigate()
  const { data: notices, isPending, isError, refetch } = useNotices()

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
        <h1 className="text-[17px] font-bold text-foreground">공지사항</h1>
      </header>

      <main className="flex-1">
        {isPending ? (
          <ListRowSkeleton className="px-5 pt-4" media={false} />
        ) : isError ? (
          <ErrorState onRetry={() => refetch()}>공지사항을 불러오지 못했어요.</ErrorState>
        ) : notices && notices.length > 0 ? (
          <NoticeAccordion notices={notices} />
        ) : (
          <EmptyState icon={<Megaphone />}>공지사항이 없어요.</EmptyState>
        )}
      </main>
    </ScreenContainer>
  )
}
