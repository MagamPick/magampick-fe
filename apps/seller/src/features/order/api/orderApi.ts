import { z } from 'zod'
import { apiClient } from '@/shared/lib/axios'
import { ORDER_STATUSES } from '../types'
import type { Order } from '../types'

// ─── BE SellerOrderResponse Zod 스키마 ───────────────────────────────────────

const orderStatusSchema = z.enum(ORDER_STATUSES)

const orderItemFromResponseSchema = z.object({
  id: z.number().optional(),
  kind: z.string().optional(),
  name: z.string().optional(),
  imageUrl: z.string().nullable().optional(),
  originalPrice: z.number().optional(),
  salePrice: z.number().optional(),
  qty: z.number().optional(),
})

/**
 * BE SellerOrderResponse Zod 스키마.
 * status 는 도메인 7-enum 으로 엄격 검증 — enum 밖 값(예: AWAITING_PAYMENT)은 parse 에서 throw.
 * (런타임 리스크: 실 데이터 미검증 — strict 7-enum 채택, enum 밖 유입 시 전체 throw, 목록은 ErrorState 표시)
 */
export const sellerOrderResponseSchema = z.object({
  id: z.number().optional(),
  orderNo: z.string().optional(),
  storeId: z.number().optional(),
  storeName: z.string().optional(),
  storePhone: z.string().nullable().optional(),
  items: z.array(orderItemFromResponseSchema).optional(),
  pickup: z
    .object({
      type: z.string().optional(),
      time: z.string().optional(),
    })
    .optional(),
  memo: z.string().optional(),
  amounts: z
    .object({
      normalTotal: z.number().optional(),
      discountTotal: z.number().optional(),
      payTotal: z.number().optional(),
    })
    .optional(),
  pickupCode: z.string().optional(),
  /** 도메인 7-enum 엄격 검증 (PENDING·PREPARING·READY·COMPLETED·NO_SHOW·REJECTED·CANCELLED) */
  status: orderStatusSchema,
  paymentMethod: z.string().optional(),
  createdAt: z.string().optional(),
  customerName: z.string().optional(),
  customerPhone: z.string().nullable().optional(),
  acceptedAt: z.string().nullable().optional(),
  readyAt: z.string().nullable().optional(),
  completedAt: z.string().nullable().optional(),
  rejectedAt: z.string().nullable().optional(),
  cancelledAt: z.string().nullable().optional(),
})

type SellerOrderResponse = z.infer<typeof sellerOrderResponseSchema>

// ─── BE → FE 도메인 매핑 ─────────────────────────────────────────────────────

/**
 * BE SellerOrderResponse → FE Order 변환 (소비자 mapToClientOrder 패턴 미러).
 * - id·storeId: number → string
 * - items[].qty → quantity, salePrice → price
 * - pickup: type+time 플랫 → pickupTime ('ASAP' | 'HH:mm')
 * - paymentMethod 'toss' → '토스페이' (그 외 원문 유지)
 * - status: strict 7-enum (schema 단계에서 검증 완료)
 * BE 미사용 필드(storeName/storePhone, item kind/imageUrl/originalPrice,
 *   amounts.normalTotal/discountTotal, 전이 타임스탬프)는 현 UI 미사용 → 매핑 생략.
 */
export function mapToSellerOrder(res: SellerOrderResponse): Order {
  const pickupType = res.pickup?.type?.toUpperCase()
  const pickupTime =
    pickupType === 'SLOT' && res.pickup?.time ? res.pickup.time : 'ASAP'

  return {
    id: String(res.id ?? 0),
    storeId: String(res.storeId ?? 0),
    orderNo: res.orderNo ?? '',
    customerName: res.customerName ?? '',
    customerPhone: res.customerPhone ?? '',
    placedAt: res.createdAt ?? new Date().toISOString(),
    pickupTime,
    pickupCode: res.pickupCode ?? '0000',
    status: res.status,
    memo: res.memo ?? '',
    items: (res.items ?? []).map((item) => ({
      name: item.name ?? '',
      quantity: item.qty ?? 1,
      price: item.salePrice ?? 0,
    })),
    total: res.amounts?.payTotal ?? 0,
    paymentMethod: res.paymentMethod === 'toss' ? '토스페이' : (res.paymentMethod ?? ''),
  }
}

// ─── orderApi ────────────────────────────────────────────────────────────────

export const orderApi = {
  /**
   * 매장 주문 목록 — 최신순(placedAt desc).
   * segment 파라미터 미사용: 전체 fetch 후 client 5세그먼트 분류·신규/준비중 건수 뱃지·검색을 FE 에서 처리.
   */
  async listOrders(storeId: string): Promise<Order[]> {
    const { data } = await apiClient.get(`/seller/stores/${storeId}/orders`)
    const list = z.array(sellerOrderResponseSchema).parse(data)
    return list
      .map(mapToSellerOrder)
      .sort((a, b) => (a.placedAt < b.placedAt ? 1 : a.placedAt > b.placedAt ? -1 : 0))
  },

  /** 주문 단건 조회 (사장 주문 상세) */
  async getOrder(id: string): Promise<Order> {
    const { data } = await apiClient.get(`/seller/orders/${id}`)
    return mapToSellerOrder(sellerOrderResponseSchema.parse(data))
  },

  /** 수락 — PENDING → PREPARING (노션 주문 수락/거절) */
  async acceptOrder(id: string): Promise<Order> {
    const { data } = await apiClient.post(`/seller/orders/${id}/accept`)
    return mapToSellerOrder(sellerOrderResponseSchema.parse(data))
  },

  /** 거절 — PENDING → REJECTED, 자동환불(BE 소관) (노션 주문 수락/거절) */
  async rejectOrder(id: string): Promise<Order> {
    const { data } = await apiClient.post(`/seller/orders/${id}/reject`)
    return mapToSellerOrder(sellerOrderResponseSchema.parse(data))
  },

  /** 준비완료 — PREPARING → READY, 픽업 코드 안내(노션 주문 상태 변경) */
  async readyOrder(id: string): Promise<Order> {
    const { data } = await apiClient.post(`/seller/orders/${id}/ready`)
    return mapToSellerOrder(sellerOrderResponseSchema.parse(data))
  },

  /** 수령완료 — READY → COMPLETED, 사장이 픽업 코드 확인 후(노션 주문 상태 변경) */
  async completeOrder(id: string): Promise<Order> {
    const { data } = await apiClient.post(`/seller/orders/${id}/complete`)
    return mapToSellerOrder(sellerOrderResponseSchema.parse(data))
  },

  /** 미수령 — READY → NO_SHOW, 수동 처리·환불 없음(노션 주문 상태 변경) */
  async noShowOrder(id: string): Promise<Order> {
    const { data } = await apiClient.post(`/seller/orders/${id}/no-show`)
    return mapToSellerOrder(sellerOrderResponseSchema.parse(data))
  },
}
