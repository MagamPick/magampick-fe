import { useState } from 'react'
import { useNavigate } from 'react-router'
import { ChevronLeft, Search, LocateFixed, Plus } from 'lucide-react'
import { ROUTES } from '@/shared/lib/routes'
import { ScreenContainer } from '@/shared/components/ScreenContainer'
import { AddressCard } from '../components/AddressCard'
import { AddressSearchSheet } from '../components/AddressSearchSheet'
import { useAddresses } from '../hooks/useAddresses'
import { useSetDefaultAddress } from '../hooks/useSetDefaultAddress'
import { useReverseGeocode } from '../hooks/useReverseGeocode'
import type { AddressSearchResult } from '../types'

/**
 * 주소 설정 (프로토타입 60-addresses). 저장된 주소 목록 + 현재위치/검색으로 추가 진입 + 기본 전환.
 * 추가 흐름: 검색/현재위치로 도로명+좌표를 정한 뒤 입력 페이지(/addresses/new)로 state 전달.
 * 진입(마이페이지·홈 헤더 링크)은 후속 PR — 지금은 /addresses 직접 진입으로 동작.
 */
export function AddressListPage() {
  const navigate = useNavigate()
  const { data: addresses, isPending } = useAddresses()
  const setDefault = useSetDefaultAddress()
  const reverseGeocode = useReverseGeocode()
  const [sheetOpen, setSheetOpen] = useState(false)

  // 기본 주소를 맨 위로 (배달앱 패턴) — 나머지는 등록순 유지(stable sort)
  const sortedAddresses = addresses
    ? [...addresses].sort((a, b) => Number(b.isDefault) - Number(a.isDefault))
    : []

  function goToNew(result: AddressSearchResult) {
    navigate(ROUTES.ADDRESS_NEW, { state: { result } })
  }

  function useCurrentLocation() {
    reverseGeocode.mutate(undefined, { onSuccess: (result) => goToNew(result) })
  }

  return (
    <ScreenContainer variant="page">
      <header className="sticky top-0 z-10 flex h-[52px] items-center gap-1 border-b border-border bg-card px-2">
        <button
          type="button"
          onClick={() => navigate(ROUTES.MYPAGE)}
          aria-label="뒤로 가기"
          className="flex h-10 w-10 items-center justify-center text-foreground"
        >
          <ChevronLeft className="h-[22px] w-[22px]" />
        </button>
        <h1 className="text-[17px] font-bold text-foreground">주소 설정</h1>
      </header>

      <main className="flex-1 px-5 pb-10">
        {/* 검색바 */}
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="mt-4 flex w-full items-center gap-2 rounded-xl border-[1.5px] border-border bg-background px-3.5 py-3 text-left"
        >
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="text-sm text-[#bdbdbd]">도로명, 건물명, 지번으로 검색</span>
        </button>

        {/* 현재 위치로 찾기 */}
        <button
          type="button"
          onClick={useCurrentLocation}
          disabled={reverseGeocode.isPending}
          className="mt-3 flex min-h-[50px] w-full items-center justify-center gap-2 rounded-xl border-[1.25px] border-border bg-card px-4 text-sm font-bold text-foreground disabled:opacity-60"
        >
          <LocateFixed className="h-[18px] w-[18px]" />
          {reverseGeocode.isPending ? '위치 찾는 중…' : '현재 위치로 찾기'}
        </button>

        {/* 주소 추가 */}
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="mt-[18px] flex min-h-[56px] w-full items-center gap-2.5 text-[16px] font-extrabold text-foreground"
        >
          <Plus className="h-5 w-5" />
          주소 추가
        </button>

        {/* 목록 */}
        {isPending ? (
          <p className="py-10 text-center text-sm text-muted-foreground">불러오는 중…</p>
        ) : sortedAddresses.length > 0 ? (
          <div className="mt-1">
            {sortedAddresses.map((address) => (
              <AddressCard
                key={address.id}
                address={address}
                disabled={setDefault.isPending}
                onSelect={() => setDefault.mutate(address.id)}
                onEdit={() => navigate(ROUTES.ADDRESS_EDIT(address.id))}
              />
            ))}
          </div>
        ) : (
          <div className="px-5 py-14 text-center">
            <div className="text-[44px]">📍</div>
            <p className="mt-3 text-sm font-semibold text-muted-foreground">
              저장된 주소가 없어요.
              <br />
              위에서 새 주소를 추가해보세요.
            </p>
          </div>
        )}
      </main>

      <AddressSearchSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onSelect={(result) => goToNew(result)}
      />
    </ScreenContainer>
  )
}
