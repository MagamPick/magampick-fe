import { useMutation, useQueryClient } from '@tanstack/react-query'
import { refundApi } from '../api/refundApi'
import { refundKeys } from './refundKeys'

/**
 * 환불 승인/거부 mutation 묶음 (노션 「환불 승인/거부」).
 * 둘 다 성공 시 목록 무효화가 동일하므로 한 훅으로 묶음(useOrderActions 패턴).
 * approve variable = 요청 id(string), reject variable = { id, reason }.
 */
export function useRefundActions(storeId: string) {
  const queryClient = useQueryClient()

  const onSuccess = () => {
    queryClient.invalidateQueries({ queryKey: refundKeys.list(storeId) })
  }

  const approve = useMutation({
    mutationFn: (id: string) => refundApi.approveRefund(id),
    onSuccess,
  })
  const reject = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      refundApi.rejectRefund(id, reason),
    onSuccess,
  })

  return { approve, reject }
}
