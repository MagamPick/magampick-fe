import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router'
import { ROUTES } from '@/shared/lib/routes'
import { ErrorState } from '@/shared/components/ErrorState'
import { useCurrentStoreStore } from '../stores/currentStoreStore'
import { useStore } from '../hooks/useStore'
import { StoreEditForm } from '../components/StoreEditForm'

/**
 * 매장 정보 수정 — 헤더 + 현재 매장(selectedStoreId) 상세 미리채움 폼(셸).
 * 영업시간/매장 관리와 동일하게 "현재 매장" 기준(URL param 없음). 폼이 CTA·제출·이동을 담당.
 */
export function StoreEditPage() {
  const navigate = useNavigate()
  const storeId = useCurrentStoreStore((s) => s.selectedStoreId)
  const { data: detail, isLoading, refetch } = useStore(storeId)

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-card">
      <header className="sticky top-0 z-10 flex h-[52px] items-center gap-1 border-b border-border bg-card px-2">
        <button
          type="button"
          aria-label="뒤로 가기"
          onClick={() => navigate(ROUTES.STORE_MANAGE)}
          className="flex size-10 items-center justify-center rounded-full text-foreground active:bg-muted"
        >
          <ChevronLeft className="size-[22px]" />
        </button>
        <h1 className="text-[16px] font-bold">매장 정보 수정</h1>
      </header>

      {detail ? (
        <StoreEditForm detail={detail} />
      ) : isLoading ? (
        <div className="flex flex-1 items-center justify-center py-20 text-sm text-muted-foreground">
          불러오는 중…
        </div>
      ) : (
        <ErrorState onRetry={() => refetch()}>매장 정보를 불러오지 못했어요.</ErrorState>
      )}
    </div>
  )
}
