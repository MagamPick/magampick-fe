import { ChevronLeft } from 'lucide-react'
import { Navigate, useNavigate, useParams } from 'react-router'
import { ROUTES } from '@/shared/lib/routes'
import { ScreenContainer } from '@/shared/components/ScreenContainer'
import { useGeolocation } from '@/shared/hooks/useGeolocation'
import { storeDetailParamsSchema } from '../types'
import { useStoreDetail } from '../hooks/useStoreDetail'
import { walkAndDistanceLabel } from '../lib/walkTime'
import { StoreLocationMap } from '../components/StoreLocationMap'

/**
 * '매장 위치' sub-route — 카카오맵 위 내 위치(GPS, fallback 기본 주소지) + 매장 마커 + 직선 점선 연결,
 * 줌 컨트롤·축척. 하단 카드 = 매장명·평점·거리·도보 시간(직선거리 × 15분/km, 외부 길찾기 API X).
 * 매장 상세의 '지도' 액션으로 진입하는 단일 매장 전용 화면 — 메인 지도 탭(필터·마커 리스트)과 무관.
 */
export function StoreLocationPage() {
  const params = useParams()
  const navigate = useNavigate()
  const parsed = storeDetailParamsSchema.safeParse(params)
  const { data: store } = useStoreDetail(parsed.success ? Number(parsed.data.id) : 0)
  const { position } = useGeolocation()

  if (!parsed.success) return <Navigate to={ROUTES.HOME} replace />

  return (
    <ScreenContainer variant="bleed" className="flex flex-col">
      <header className="sticky top-0 z-10 flex h-[52px] flex-shrink-0 items-center gap-1 border-b border-border bg-card px-2">
        <button
          type="button"
          aria-label="뒤로 가기"
          onClick={() => navigate(-1)}
          className="flex size-10 items-center justify-center rounded-full text-foreground"
        >
          <ChevronLeft className="size-[22px]" aria-hidden />
        </button>
        <span className="text-base font-bold">매장 위치</span>
      </header>

      {store ? (
        <StoreLocationMap lat={store.lat} lng={store.lng} name={store.name} myPosition={position} />
      ) : (
        <div className="h-[480px] flex-shrink-0 animate-pulse bg-muted" aria-hidden />
      )}

      {/* 하단 카드 */}
      <div className="p-5">
        <div className="rounded-[16px] border border-border bg-card p-4 shadow-[0_4px_12px_rgb(15_15_15/0.06)]">
          <div className="text-base font-extrabold tracking-[-0.3px]">{store?.name ?? '매장'}</div>
          <div className="mt-1.5 text-[13px] font-semibold text-muted-foreground">
            ★ {store?.rating ?? '-'} · {store?.distanceKm ?? '-'}km
          </div>
          <div className="mt-2 text-[13px] font-bold text-secondary-foreground">
            🚶 {store ? walkAndDistanceLabel(store.distanceKm) : '도보 정보 계산 중…'}
          </div>
        </div>
      </div>
    </ScreenContainer>
  )
}
