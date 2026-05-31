import { useState } from 'react'
import { ChevronLeft, Minus, Plus, Store } from 'lucide-react'
import { Navigate, useNavigate, useParams } from 'react-router'
import { ROUTES } from '@/shared/lib/routes'
import { ScreenContainer } from '@/shared/components/ScreenContainer'
import { storeDetailParamsSchema } from '../types'
import { useStoreDetail } from '../hooks/useStoreDetail'
import { walkAndDistanceLabel } from '../lib/walkTime'

/**
 * '매장 위치' sub-route — placeholder 지도(내 위치·매장 핀·점선) + 하단 카드.
 * ⚠️ 실제 카카오맵 SDK 렌더·GPS·좌표는 FE 연동 단계. 지금은 프로토타입식 정적 placeholder.
 */
const ZOOM_LEVELS = [
  { ux: 40, uy: 60, sx: 60, sy: 40, scale: '1:10,000', grid: 52 },
  { ux: 32, uy: 68, sx: 68, sy: 32, scale: '1:5,000', grid: 36 },
  { ux: 22, uy: 78, sx: 78, sy: 22, scale: '1:2,500', grid: 26 },
]

export function StoreLocationPage() {
  const params = useParams()
  const navigate = useNavigate()
  const parsed = storeDetailParamsSchema.safeParse(params)
  const { data: store } = useStoreDetail(parsed.success ? parsed.data.id : '')
  const [zoom, setZoom] = useState(1)

  if (!parsed.success) return <Navigate to={ROUTES.HOME} replace />

  const z = ZOOM_LEVELS[zoom]

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

      <div
        className="relative h-[480px] flex-shrink-0 overflow-hidden"
        style={{
          background:
            'radial-gradient(circle at 30% 70%, #DFEEFE 0%, transparent 55%), radial-gradient(circle at 70% 30%, #FFE7D6 0%, transparent 55%), linear-gradient(180deg, #EEF5FB 0%, #F4F7FA 100%)',
        }}
      >
        {/* 그리드 */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 transition-all duration-300"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.04) 1px, transparent 1px)',
            backgroundSize: `${z.grid}px ${z.grid}px`,
          }}
        />

        {/* 두 마커를 잇는 점선 */}
        <svg
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <line
            x1={z.ux}
            y1={z.uy}
            x2={z.sx}
            y2={z.sy}
            stroke="var(--primary)"
            strokeWidth="0.8"
            strokeDasharray="2 2"
            strokeLinecap="round"
          />
        </svg>

        {/* 내 위치 (파란 점 + 펄스) */}
        <div
          className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5 transition-all duration-300"
          style={{ left: `${z.ux}%`, top: `${z.uy}%` }}
          aria-label="내 위치"
        >
          <span className="relative flex size-5 items-center justify-center">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-info/40" />
            <span className="relative inline-flex size-5 rounded-full border-[3px] border-white bg-info shadow-[0_0_0_6px_rgba(13,110,253,0.22)]" />
          </span>
          <span className="rounded-[10px] bg-foreground/85 px-[9px] py-[3px] text-[11px] font-bold text-white">
            내 위치
          </span>
        </div>

        {/* 매장 위치 (주황 핀) */}
        <div
          className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5 transition-all duration-300"
          style={{ left: `${z.sx}%`, top: `${z.sy}%` }}
          aria-label="매장 위치"
        >
          <span className="flex size-11 rotate-[-45deg] items-center justify-center rounded-[50%_50%_50%_0] border-[3px] border-white bg-primary text-white shadow-[0_6px_14px_rgba(255,107,53,0.35)]">
            <Store className="size-[22px] rotate-45" aria-hidden />
          </span>
          <span className="rounded-[10px] bg-secondary-foreground px-[9px] py-[3px] text-[11px] font-bold text-white">
            {store?.name ?? '매장'}
          </span>
        </div>

        {/* 줌 컨트롤 */}
        <div className="absolute right-[14px] top-[14px] flex flex-col overflow-hidden rounded-[10px] bg-white shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
          <button
            type="button"
            aria-label="확대"
            disabled={zoom >= ZOOM_LEVELS.length - 1}
            onClick={() => setZoom((v) => Math.min(ZOOM_LEVELS.length - 1, v + 1))}
            className="flex size-[38px] items-center justify-center border-b border-border text-foreground disabled:text-[#bdbdbd]"
          >
            <Plus className="size-[18px]" aria-hidden />
          </button>
          <button
            type="button"
            aria-label="축소"
            disabled={zoom <= 0}
            onClick={() => setZoom((v) => Math.max(0, v - 1))}
            className="flex size-[38px] items-center justify-center text-foreground disabled:text-[#bdbdbd]"
          >
            <Minus className="size-[18px]" aria-hidden />
          </button>
        </div>

        {/* 축척 */}
        <span
          aria-live="polite"
          className="pointer-events-none absolute bottom-[14px] left-[14px] rounded-[8px] bg-white/90 px-[9px] py-1 text-[11px] font-bold tabular-nums text-foreground shadow-[0_2px_6px_rgba(0,0,0,0.08)]"
        >
          {z.scale}
        </span>
      </div>

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
