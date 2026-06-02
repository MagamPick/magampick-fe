import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { ChevronLeft } from 'lucide-react'
import { ScreenContainer } from '@/shared/components/ScreenContainer'
import { SegTabs, type SegTabItem } from '@/shared/components/SegTabs'
import { EmptyState } from '@/shared/components/EmptyState'
import { ROUTES } from '@/shared/lib/routes'
import { useCoupons } from '../hooks/useCoupons'
import type { CouponStatus } from '../types'
import { CouponCard } from '../components/CouponCard'

/**
 * 쿠폰함 (노션 「쿠폰함 조회」, 프로토타입 56-coupons).
 * 사용 가능/사용 완료/만료 탭 + 탭별 개수. 헤더·빈 상태에서 이벤트 화면으로 진입.
 */
export function CouponBoxPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<CouponStatus>('usable')
  const { data: coupons, isLoading } = useCoupons()

  const counts = useMemo(() => {
    const c = { usable: 0, used: 0, expired: 0 }
    for (const coupon of coupons ?? []) c[coupon.status]++
    return c
  }, [coupons])

  const tabs: SegTabItem<CouponStatus>[] = [
    { value: 'usable', label: '사용 가능', count: counts.usable },
    { value: 'used', label: '사용 완료', count: counts.used },
    { value: 'expired', label: '만료', count: counts.expired },
  ]
  const visible = (coupons ?? []).filter((c) => c.status === tab)

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
        <h1 className="text-[17px] font-bold text-foreground">쿠폰함</h1>
        <button
          type="button"
          onClick={() => navigate(ROUTES.EVENTS)}
          className="ml-auto min-h-11 px-2 text-[13px] font-bold text-secondary-foreground"
        >
          이벤트 →
        </button>
      </header>

      <SegTabs ariaLabel="쿠폰 상태" tabs={tabs} value={tab} onChange={setTab} />

      <main className="flex-1">
        {isLoading ? (
          <p className="py-16 text-center text-sm text-muted-foreground">불러오는 중…</p>
        ) : visible.length > 0 ? (
          <div className="flex flex-col gap-2.5 px-5 pb-6 pt-3">
            {visible.map((coupon) => (
              <CouponCard key={coupon.id} coupon={coupon} />
            ))}
          </div>
        ) : (
          <EmptyState icon="🎟">
            해당 쿠폰이 없어요.
            <br />
            <button
              type="button"
              onClick={() => navigate(ROUTES.EVENTS)}
              className="mt-2 inline-block min-h-8 px-1 text-[13px] font-bold text-secondary-foreground underline"
            >
              이벤트에서 쿠폰을 받아보세요
            </button>
          </EmptyState>
        )}
      </main>
    </ScreenContainer>
  )
}
