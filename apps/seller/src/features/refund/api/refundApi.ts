import { z } from 'zod'
import { apiClient } from '@/shared/lib/axios'
import { nullish, nullableString, nullableNumber } from '@/shared/lib/zodNullable'
import type { RefundRequest } from '../types'

// ─── BE RefundResponse Zod 스키마 ─────────────────────────────────────────────

const refundItemResponseSchema = z.object({
  name: nullableString(),
  quantity: nullableNumber(),
  price: nullableNumber(),
})

/**
 * BE RefundResponse Zod 스키마.
 * status 는 3-enum 으로 엄격 검증 — enum 밖 값은 parse 에서 throw.
 * nullable 타임스탬프는 `.nullable().optional()` 처리.
 */
const refundResponseSchema = z.object({
  id: nullableNumber(),
  orderId: nullableNumber(),
  orderNo: nullableString(),
  storeId: nullableNumber(),
  customerName: nullableString(),
  items: nullish(z.array(refundItemResponseSchema)),
  amount: nullableNumber(),
  pickupCompletedAt: z.string().nullable().optional(),
  status: z.enum(['REQUESTED', 'APPROVED', 'REJECTED']),
  reason: nullableString(),
  requestedAt: nullableString(),
  rejectReason: z.string().nullable().optional(),
  resolvedAt: z.string().nullable().optional(),
})

type RefundResponse = z.infer<typeof refundResponseSchema>

// ─── BE → FE 도메인 매핑 ──────────────────────────────────────────────────────

/**
 * BE RefundResponse → FE RefundRequest 변환.
 * - id·orderId·storeId: number → String()
 * - rejectReason·resolvedAt: null → undefined
 * - pickupCompletedAt: null → ''
 */
function mapToRefund(res: RefundResponse): RefundRequest {
  return {
    id: String(res.id ?? 0),
    orderId: String(res.orderId ?? 0),
    orderNo: res.orderNo ?? '',
    storeId: String(res.storeId ?? 0),
    customerName: res.customerName ?? '',
    items: (res.items ?? []).map((item) => ({
      name: item.name ?? '',
      quantity: item.quantity ?? 1,
      price: item.price ?? 0,
    })),
    amount: res.amount ?? 0,
    pickupCompletedAt: res.pickupCompletedAt ?? '',
    status: res.status,
    reason: res.reason ?? '',
    requestedAt: res.requestedAt ?? new Date().toISOString(),
    rejectReason: res.rejectReason ?? undefined,
    resolvedAt: res.resolvedAt ?? undefined,
  }
}

// ─── refundApi ─────────────────────────────────────────────────────────────────

export const refundApi = {
  /** 매장 환불 요청 목록 — 최신순(requestedAt desc). ROLE_SELLER 인증 필요. */
  async listRefundRequests(storeId: string): Promise<RefundRequest[]> {
    const { data } = await apiClient.get(`/seller/stores/${storeId}/refunds`)
    const list = z.array(refundResponseSchema).parse(data)
    return list
      .map(mapToRefund)
      .sort((a, b) => (a.requestedAt < b.requestedAt ? 1 : a.requestedAt > b.requestedAt ? -1 : 0))
  },

  /** 환불 승인 — REQUESTED → APPROVED(전액 환불). ROLE_SELLER 인증 필요. */
  async approveRefund(id: string): Promise<RefundRequest> {
    const { data } = await apiClient.post(`/seller/refunds/${id}/approve`)
    return mapToRefund(refundResponseSchema.parse(data))
  },

  /** 환불 거부 — REQUESTED → REJECTED(거부 사유 소비자 노출). ROLE_SELLER 인증 필요. */
  async rejectRefund(id: string, reason: string): Promise<RefundRequest> {
    const { data } = await apiClient.post(`/seller/refunds/${id}/reject`, { rejectReason: reason })
    return mapToRefund(refundResponseSchema.parse(data))
  },
}
