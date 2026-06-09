import { useMutation, useQueryClient } from '@tanstack/react-query'
import { storeApi } from '../api/storeApi'
import { storeKeys } from './storeKeys'
import type { UpdateStoreInput } from '../types'

/**
 * 매장 정보 수정 — BE multipart PATCH /seller/stores/{storeId}.
 * 부분 수정(변경 필드만): 주소 미변경 시 지오코딩 재호출 없음.
 * 성공 시 보유 매장 목록(매장명 변경 반영)·해당 매장 상세를 무효화.
 * 성공 후 화면 이동(매장 관리 복귀)은 호출 측(폼)이 담당.
 */
export function useUpdateStore() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateStoreInput) => storeApi.updateStore(input),
    onSuccess: (detail) => {
      queryClient.invalidateQueries({ queryKey: storeKeys.list() })
      queryClient.invalidateQueries({ queryKey: storeKeys.detail(detail.id) })
    },
  })
}
