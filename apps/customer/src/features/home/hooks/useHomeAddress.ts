import { useAddresses } from '@/features/addresses/hooks/useAddresses'

/**
 * 홈 헤더에 표시할 기본 주소지 라벨 (피드 기준점).
 * 전용 엔드포인트 없음 — 주소지 목록(useAddresses)에서 isDefault===true 항목의 label 파생.
 * HomeHeader 와의 호환 시그니처: data?.label 형태를 그대로 유지.
 */
export function useHomeAddress() {
  const query = useAddresses()
  const defaultAddress = query.data?.find((a) => a.isDefault)
  return {
    ...query,
    data: defaultAddress ? { label: defaultAddress.label } : undefined,
  }
}
