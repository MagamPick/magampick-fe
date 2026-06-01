import { useMutation, useQueryClient } from '@tanstack/react-query'
import { orderApi } from '../api/orderApi'
import { orderKeys } from './orderKeys'
import type { Order } from '../types'

/**
 * 사장 주문 상태 전이 mutation 묶음 — 수락/거절/준비완료/수령완료/미수령.
 * 전이 5종의 무효화(목록 + 해당 상세)가 동일하므로 한 훅으로 묶었다.
 * 목록 카드 인라인 액션·상세 CTA 양쪽에서 사용(노션: 진입점 = 목록 + 상세).
 * 각 mutation 의 variable 은 주문 id(string).
 */
export function useOrderActions(storeId: string) {
  const queryClient = useQueryClient()

  const onSuccess = (order: Order) => {
    queryClient.invalidateQueries({ queryKey: orderKeys.list(storeId) })
    queryClient.invalidateQueries({ queryKey: orderKeys.detail(order.id) })
  }

  const accept = useMutation({ mutationFn: (id: string) => orderApi.acceptOrder(id), onSuccess })
  const reject = useMutation({ mutationFn: (id: string) => orderApi.rejectOrder(id), onSuccess })
  const ready = useMutation({ mutationFn: (id: string) => orderApi.readyOrder(id), onSuccess })
  const complete = useMutation({ mutationFn: (id: string) => orderApi.completeOrder(id), onSuccess })
  const noShow = useMutation({ mutationFn: (id: string) => orderApi.noShowOrder(id), onSuccess })

  return { accept, reject, ready, complete, noShow }
}
