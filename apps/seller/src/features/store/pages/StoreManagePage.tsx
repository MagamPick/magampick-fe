import { ChevronLeft, ChevronRight, Store, Clock, Pencil, ClipboardList } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import { cn } from '@/shared/lib/utils'
import { ROUTES } from '@/shared/lib/routes'
import { useCurrentStoreStore } from '@/features/store/stores/currentStoreStore'
import { useStores } from '@/features/store/hooks/useStores'
import { useStoreStatus } from '@/features/store/hooks/useStoreStatus'
import { useBusinessHours } from '@/features/store/hooks/useBusinessHours'
import { getStatusDotClass, getStatusLabel } from '@/features/store/lib/transitions'
import { BusinessHoursSummary } from '@/features/store/components/BusinessHoursSummary'

/**
 * 매장 관리 허브 (최소) — 영업시간 설정 진입점.
 * 매장 정보(대표자·주소·사업자) 카드는 별도 "매장 정보" 기능 소관이라 생략.
 * 매장 정보 수정 / 휴업·폐업 신청은 대상 화면 미구현 → 비활성(준비중).
 */
export function StoreManagePage() {
  const navigate = useNavigate()
  const storeId = useCurrentStoreStore((s) => s.selectedStoreId)
  const { data: stores } = useStores()
  const { data: status } = useStoreStatus(storeId)
  const { data: hours } = useBusinessHours(storeId)

  const name = stores?.find((s) => s.id === storeId)?.name ?? '매장'

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-card pb-10">
      <header className="sticky top-0 z-10 flex h-[52px] items-center gap-1 border-b border-border bg-card px-2">
        <button
          type="button"
          aria-label="뒤로 가기"
          onClick={() => navigate(ROUTES.HOME)}
          className="flex size-10 items-center justify-center rounded-full text-foreground active:bg-muted"
        >
          <ChevronLeft className="size-[22px]" />
        </button>
        <h1 className="text-[16px] font-bold">매장 관리</h1>
      </header>

      {/* 매장 헤드 */}
      <div className="mx-5 mt-4 flex items-center gap-3.5 rounded-[16px] border border-border bg-card px-[18px] py-4">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-[14px] bg-cream">
          <Store className="size-7 text-muted-foreground" aria-hidden />
        </span>
        <div className="flex min-w-0 flex-col items-start gap-1.5">
          <span className="truncate text-[17px] font-extrabold tracking-tight">{name}</span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-[12px] font-bold text-foreground">
            <span
              className={cn(
                'size-2 rounded-full',
                status ? getStatusDotClass(status.operationStatus) : 'bg-muted-foreground',
              )}
            />
            {status
              ? getStatusLabel(status.operationStatus, status.todayCloseTime)
              : '불러오는 중…'}
          </span>
        </div>
      </div>

      {/* 영업시간 요약 */}
      <BusinessHoursSummary hours={hours ?? []} />

      {/* 매장 설정 메뉴 */}
      <div className="mx-5 mt-6">
        <div className="mb-2 px-1 text-[13px] font-bold text-muted-foreground">매장 설정</div>
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <Link
            to={ROUTES.STORE_HOURS}
            className="flex items-center gap-3 px-4 py-3.5 transition active:bg-muted"
          >
            <Clock className="size-[18px] shrink-0 text-muted-foreground" aria-hidden />
            <span className="flex-1 text-[14px] font-semibold text-foreground">영업시간</span>
            <ChevronRight className="size-[18px] text-muted-foreground" />
          </Link>
          <Link
            to={ROUTES.STORE_EDIT}
            className="flex items-center gap-3 border-t border-border px-4 py-3.5 transition active:bg-muted"
          >
            <Pencil className="size-[18px] shrink-0 text-muted-foreground" aria-hidden />
            <span className="flex-1 text-[14px] font-semibold text-foreground">매장 정보 수정</span>
            <ChevronRight className="size-[18px] text-muted-foreground" />
          </Link>
          <div className="flex items-center gap-3 border-t border-border px-4 py-3.5 opacity-50">
            <ClipboardList className="size-[18px] shrink-0 text-muted-foreground" aria-hidden />
            <span className="flex-1 text-[14px] font-semibold text-foreground">휴업·폐업 신청</span>
            <span className="text-[11.5px] text-muted-foreground">준비중</span>
          </div>
        </div>
      </div>
    </div>
  )
}
