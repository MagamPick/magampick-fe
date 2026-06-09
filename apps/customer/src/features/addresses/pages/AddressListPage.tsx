import { useState } from 'react'
import { useNavigate } from 'react-router'
import { ChevronLeft, Search, LocateFixed, Plus } from 'lucide-react'
import { ROUTES } from '@/shared/lib/routes'
import { ScreenContainer } from '@/shared/components/ScreenContainer'
import { EmptyState } from '@/shared/components/EmptyState'
import { ErrorState } from '@/shared/components/ErrorState'
import { ListRowSkeleton } from '@/shared/components/Skeletons'
import { AddressCard } from '../components/AddressCard'
import { useAddresses } from '../hooks/useAddresses'
import { useSetDefaultAddress } from '../hooks/useSetDefaultAddress'
import { useReverseGeocode } from '../hooks/useReverseGeocode'
import { searchAddressForAddresses } from '../lib/addressSearch'
import type { AddressSearchResult } from '../types'

/**
 * 주소 설정 (프로토타입 60-addresses). 저장된 주소 목록 + 다음 위젯/현재위치로 추가 진입 + 기본 전환.
 * 추가 흐름: 다음 우편번호 위젯(팝업) 또는 GPS 역지오코딩으로 도로명을 정한 뒤
 *           입력 페이지(/addresses/new)로 state 전달.
 */
export function AddressListPage() {
  const navigate = useNavigate()
  const { data: addresses, isPending, isError, refetch } = useAddresses()
  const setDefault = useSetDefaultAddress()
  const reverseGeocode = useReverseGeocode()
  const [gpsError, setGpsError] = useState<string | null>(null)

  // 기본 주소를 맨 위로 (배달앱 패턴) — 나머지는 등록순 유지(stable sort)
  const sortedAddresses = addresses
    ? [...addresses].sort((a, b) => Number(b.isDefault) - Number(a.isDefault))
    : []

  function goToNew(result: AddressSearchResult) {
    navigate(ROUTES.ADDRESS_NEW, { state: { result } })
  }

  async function handleSearchAddress() {
    try {
      const result = await searchAddressForAddresses()
      goToNew(result)
    } catch {
      // 위젯 팝업 닫기(취소) — 에러 없이 무시
    }
  }

  function handleCurrentLocation() {
    setGpsError(null)
    reverseGeocode.mutate(undefined, {
      onSuccess: (result) => goToNew(result),
      onError: (e) =>
        setGpsError(e instanceof Error ? e.message : '위치를 가져오지 못했어요.'),
    })
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
        {/* 검색바 — 다음 우편번호 위젯 팝업 */}
        <button
          type="button"
          onClick={handleSearchAddress}
          className="mt-4 flex w-full items-center gap-2 rounded-xl border-[1.5px] border-border bg-background px-3.5 py-3 text-left"
        >
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="text-sm text-placeholder">도로명, 건물명, 지번으로 검색</span>
        </button>

        {/* 현재 위치로 찾기 */}
        <button
          type="button"
          onClick={handleCurrentLocation}
          disabled={reverseGeocode.isPending}
          className="mt-3 flex min-h-[50px] w-full items-center justify-center gap-2 rounded-xl border-[1.25px] border-border bg-card px-4 text-sm font-bold text-foreground disabled:opacity-60"
        >
          <LocateFixed className="h-[18px] w-[18px]" />
          {reverseGeocode.isPending ? '위치 찾는 중…' : '현재 위치로 찾기'}
        </button>
        {gpsError && (
          <p role="alert" className="mt-2 text-[12.5px] text-destructive">
            {gpsError}
          </p>
        )}

        {/* 주소 추가 — 다음 우편번호 위젯 팝업 */}
        <button
          type="button"
          onClick={handleSearchAddress}
          className="mt-[18px] flex min-h-[56px] w-full items-center gap-2.5 text-[16px] font-extrabold text-foreground"
        >
          <Plus className="h-5 w-5" />
          주소 추가
        </button>

        {/* 목록 */}
        {isPending ? (
          <ListRowSkeleton className="mt-2" media={false} />
        ) : isError ? (
          <ErrorState onRetry={() => refetch()}>주소를 불러오지 못했어요.</ErrorState>
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
          <EmptyState icon="📍">
            저장된 주소가 없어요.
            <br />
            위에서 새 주소를 추가해보세요.
          </EmptyState>
        )}
      </main>
    </ScreenContainer>
  )
}
