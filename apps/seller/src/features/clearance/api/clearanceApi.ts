/**
 * 떨이(마감 할인) 도메인 API — 실연동.
 * 참조 패턴: storeApi.ts (Zod 응답 검증 + FE 도메인 매핑).
 * 에러 정규화: apiClient interceptor(normalizeError) 처리.
 * 시간 변환: "HH:MM" → ISO pickupEndAt ("YYYY-MM-DDTHH:MM:00") 은 이 파일 책임.
 */
import { z } from 'zod'
import { apiClient } from '@/shared/lib/axios'
import { nullish, nullableString, nullableNumber } from '@/shared/lib/zodNullable'
import { clearanceStatusSchema, clearanceCloseReasonSchema } from '../types'
import type { ClearanceView, CreateClearancePayload, UpdateClearancePayload } from '../types'

// ─── 날짜 유틸 ────────────────────────────────────────────────────────────────

/** 오늘 날짜 "YYYY-MM-DD" (로컬 시각 기준) */
function todayISODate(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** "HH:MM" → ISO datetime "YYYY-MM-DDTHH:MM:00" */
function toPickupEndAt(closeTime: string): string {
  return `${todayISODate()}T${closeTime}:00`
}

/** ISO datetime → "HH:MM" (pickupEndAt → closeTime) */
function pickupEndAtToHHMM(pickupEndAt: string): string {
  return pickupEndAt.slice(11, 16)
}

// ─── BE 응답 Zod 스키마 ────────────────────────────────────────────────────────

/** ClearanceItemResponse (BE spec) */
const clearanceItemResponseSchema = z.object({
  id: z.number(),
  productId: nullableNumber(),
  // BE 가 imageUrl 을 null 로 내려줄 수 있어 nullish 로 수용 (소비자 앱 패턴 미러)
  imageUrl: z.string().nullish(),
  name: nullableString(),
  regularPrice: nullableNumber(),
  salePrice: nullableNumber(),
  totalQuantity: nullableNumber(),
  remainingQuantity: nullableNumber(),
  pickupEndAt: nullableString(),
  status: nullish(clearanceStatusSchema),
  createdAt: nullableString(),
  // 마감 사유 — BE 가 OPEN 떨이는 closeReason 을 명시적 null 로 내려줌.
  // .optional() 은 null 을 거부해 목록 전체 파싱이 throw(진행중 떨이 1개만 있어도 리스트 전체 실패) → imageUrl 과 동일하게 nullish 로 수용.
  closeReason: clearanceCloseReasonSchema.nullish(),
})

/** PageResponseClearanceItemResponse (목록) */
const pageClearanceResponseSchema = z.object({
  content: nullish(z.array(clearanceItemResponseSchema)),
})

// ─── BE 응답 → FE 도메인 매핑 ──────────────────────────────────────────────────

function toClearanceView(raw: z.infer<typeof clearanceItemResponseSchema>): ClearanceView {
  const totalQty = raw.totalQuantity ?? 0
  const remainingQty = raw.remainingQuantity ?? 0
  const soldQty = totalQty - remainingQty
  return {
    id: raw.id,
    productId: raw.productId ?? 0,
    salePrice: raw.salePrice ?? 0,
    totalQty,
    soldQty,
    closeTime: raw.pickupEndAt ? pickupEndAtToHHMM(raw.pickupEndAt) : '00:00',
    status: raw.status ?? 'CLOSED',
    createdAt: raw.createdAt ?? '',
    productName: raw.name ?? '(상품 정보 없음)',
    productImageUrl: raw.imageUrl ?? undefined,
    originalPrice: raw.regularPrice ?? 0,
    remainingQty,
    closeReason: raw.closeReason ?? undefined,
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

export const clearanceApi = {
  /**
   * GET /seller/stores/{storeId}/clearance-items?page=0&size=100&sort=createdAt,desc
   * ClearanceItemResponse[] 언랩 + FE 매핑.
   */
  async listClearances(storeId: number): Promise<ClearanceView[]> {
    const res = await apiClient.get(`/seller/stores/${storeId}/clearance-items`, {
      params: { page: 0, size: 100, sort: 'createdAt,desc' },
    })
    const parsed = pageClearanceResponseSchema.parse(res.data)
    return (parsed.content ?? []).map(toClearanceView)
  },

  /** GET /seller/stores/{storeId}/clearance-items/{clearanceItemId} */
  async getClearance(storeId: number, id: number): Promise<ClearanceView> {
    const res = await apiClient.get(`/seller/stores/${storeId}/clearance-items/${id}`)
    return toClearanceView(clearanceItemResponseSchema.parse(res.data))
  },

  /**
   * POST /seller/stores/{storeId}/clearance-items — JSON.
   * closeTime("HH:MM") → pickupEndAt(ISO) 변환 후 전송.
   * 409 이미 진행 중 떨이: apiClient interceptor 가 ApiError 로 surface.
   */
  async createClearance(storeId: number, payload: CreateClearancePayload): Promise<ClearanceView> {
    const res = await apiClient.post(`/seller/stores/${storeId}/clearance-items`, {
      productId: payload.productId,
      salePrice: payload.salePrice,
      totalQuantity: payload.totalQty,
      pickupEndAt: toPickupEndAt(payload.closeTime),
    })
    return toClearanceView(clearanceItemResponseSchema.parse(res.data))
  },

  /**
   * PATCH /seller/stores/{storeId}/clearance-items/{clearanceItemId} — JSON.
   * null 필드는 변경 없음(BE spec). remainingQuantity = 새 남은 수량(BE 가 sold 보존). closeTime → pickupEndAt 변환.
   * 409 OPEN 상태가 아님: apiClient interceptor 처리.
   */
  async updateClearance(
    storeId: number,
    id: number,
    payload: UpdateClearancePayload,
  ): Promise<ClearanceView> {
    const body: Record<string, unknown> = {}
    if (payload.salePrice !== undefined) body.salePrice = payload.salePrice
    if (payload.remainingQuantity !== undefined) body.remainingQuantity = payload.remainingQuantity
    if (payload.closeTime !== undefined) body.pickupEndAt = toPickupEndAt(payload.closeTime)
    const res = await apiClient.patch(`/seller/stores/${storeId}/clearance-items/${id}`, body)
    return toClearanceView(clearanceItemResponseSchema.parse(res.data))
  },

  /**
   * POST /seller/stores/{storeId}/clearance-items/{clearanceItemId}/close — OPEN → CLOSED.
   * 이미 마감된 경우 BE가 200 반환(멱등). 404 떨이 없음 → ApiError surface.
   */
  async closeClearance(storeId: number, id: number): Promise<ClearanceView> {
    const res = await apiClient.post(
      `/seller/stores/${storeId}/clearance-items/${id}/close`,
    )
    return toClearanceView(clearanceItemResponseSchema.parse(res.data))
  },
}
