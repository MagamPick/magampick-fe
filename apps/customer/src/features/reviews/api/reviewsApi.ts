import { z } from 'zod'
import { apiClient } from '@/shared/lib/axios'
import { QUICK_TAGS, REVIEW_TAG_CODE } from '../types'
import type {
  MyReview,
  ReviewableOrder,
  CreateReviewPayload,
  UpdateReviewPayload,
  QuickTag,
  ReviewPhoto,
} from '../types'

// ─── BE 응답 Zod 스키마 ──────────────────────────────────────────────────────

const reviewedProductSchema = z.object({
  productId: z.number().optional(),
  kind: z.string().optional(),
  name: z.string().optional(),
})

const orderedItemSchema = z.object({
  productId: z.number().optional(),
  kind: z.string().optional(),
  name: z.string().optional(),
})

export const myReviewResponseSchema = z.object({
  id: z.number().optional(),
  storeId: z.number().optional(),
  storeName: z.string().optional(),
  items: z.array(reviewedProductSchema).optional(),
  rating: z.number().optional(),
  content: z.string().optional(),
  /** BE 는 한국어 라벨 배열로 반환 */
  tags: z.array(z.string()).optional(),
  photos: z.array(z.string()).optional(),
  createdAt: z.string().optional(),
  /** absent 또는 null → null (sic: BE spec ownerReply?: string) */
  ownerReply: z.string().nullable().optional(),
})

export const reviewableOrderResponseSchema = z.object({
  orderId: z.number().optional(),
  storeId: z.number().optional(),
  storeName: z.string().optional(),
  items: z.array(orderedItemSchema).optional(),
  pickedUpAt: z.string().optional(),
  reviewed: z.boolean().optional(),
  reviewId: z.number().nullable().optional(),
})

// ─── BE 응답 → 클라이언트 타입 변환 ─────────────────────────────────────────

function mapToMyReview(res: z.infer<typeof myReviewResponseSchema>): MyReview {
  return {
    id: String(res.id ?? 0),
    storeId: String(res.storeId ?? 0),
    storeName: res.storeName ?? '',
    items: (res.items ?? []).map((item) => ({
      productId: String(item.productId ?? 0),
      kind: item.kind?.toLowerCase() === 'deal' ? 'deal' : 'menu',
      name: item.name ?? '',
    })),
    rating: res.rating ?? 0,
    content: res.content ?? '',
    /**
     * BE 응답 tags = 한국어 라벨 배열.
     * 방어필터: QUICK_TAGS에 없는 미지 라벨은 드롭 (BE 라벨 문자열 미검증 안전장치).
     */
    tags: (res.tags ?? []).filter((t) => (QUICK_TAGS as readonly string[]).includes(t)),
    photos: res.photos ?? [],
    createdAt: res.createdAt ?? '',
    ownerReply: res.ownerReply ?? null,
  }
}

function mapToReviewableOrder(res: z.infer<typeof reviewableOrderResponseSchema>): ReviewableOrder {
  return {
    orderId: String(res.orderId ?? 0),
    storeId: String(res.storeId ?? 0),
    storeName: res.storeName ?? '',
    items: (res.items ?? []).map((item) => ({
      productId: String(item.productId ?? 0),
      kind: item.kind?.toLowerCase() === 'deal' ? 'deal' : 'menu',
      name: item.name ?? '',
    })),
    pickedUpAt: res.pickedUpAt ?? '',
    reviewed: res.reviewed ?? false,
    reviewId: res.reviewId != null ? String(res.reviewId) : null,
  }
}

// ─── 태그 코드 변환 ──────────────────────────────────────────────────────────

/**
 * FE 한국어 태그 라벨 → BE enum 코드 변환.
 * REVIEW_TAG_CODE 에 없는 라벨은 필터.
 */
function toTagCodes(labels: string[]): string[] {
  return labels
    .map((label) => REVIEW_TAG_CODE[label as QuickTag])
    .filter((code): code is string => Boolean(code))
}

// ─── multipart 빌더 ───────────────────────────────────────────────────────────

/**
 * 리뷰 multipart FormData 조립 (X5-BE 계약).
 * - request: 텍스트 메타(JSON Blob 파트) — rating·content·tags(+update 의 keepImageUrls)
 * - photos: 새로 고른 File 들(File 파트). 기존 사진(http URL)은 업로드하지 않고 request 에만 남긴다.
 */
function buildReviewForm(request: object, photos: ReviewPhoto[]): FormData {
  const form = new FormData()
  form.append('request', new Blob([JSON.stringify(request)], { type: 'application/json' }))
  for (const photo of photos) {
    if (photo.kind === 'new') form.append('photos', photo.file)
  }
  return form
}

const MULTIPART_HEADERS = { headers: { 'Content-Type': 'multipart/form-data' } }

// ─── API ─────────────────────────────────────────────────────────────────────

export const reviewsApi = {
  /** GET /api/v1/customers/me/reviews — 내가 쓴 리뷰 목록 (최신순) */
  async listMyReviews(): Promise<MyReview[]> {
    const { data } = await apiClient.get('/customers/me/reviews')
    const list = z.array(myReviewResponseSchema).parse(data)
    return list.map(mapToMyReview)
  },

  /** GET /api/v1/orders/reviewable — 리뷰 작성 가능한 완료 주문 목록 */
  async listReviewableOrders(): Promise<ReviewableOrder[]> {
    const { data } = await apiClient.get('/orders/reviewable')
    const list = z.array(reviewableOrderResponseSchema).parse(data)
    return list.map(mapToReviewableOrder)
  },

  /**
   * GET /api/v1/orders/{orderId}/review — 주문별 리뷰.
   * 204 (리뷰 없음) → null. axios 204 는 data 가 '' 또는 null → !data 로 판별.
   */
  async getReviewByOrder(orderId: string): Promise<MyReview | null> {
    const res = await apiClient.get(`/orders/${orderId}/review`)
    if (res.status === 204 || !res.data) return null
    return mapToMyReview(myReviewResponseSchema.parse(res.data))
  },

  /**
   * POST /api/v1/orders/{orderId}/reviews — 리뷰 작성 (201, multipart/form-data).
   * 텍스트(별점·후기·태그)는 request JSON 파트, 새 사진은 photos File 파트로 전송 → BE 가 OCI 업로드.
   * tags: FE 한국어 라벨 → BE enum 코드 변환 후 전송.
   */
  async createReview(payload: CreateReviewPayload): Promise<MyReview> {
    const form = buildReviewForm(
      {
        rating: payload.rating,
        content: payload.content.trim(),
        tags: toTagCodes(payload.tags),
      },
      payload.photos,
    )
    const { data } = await apiClient.post(`/orders/${payload.orderId}/reviews`, form, MULTIPART_HEADERS)
    return mapToMyReview(myReviewResponseSchema.parse(data))
  },

  /**
   * PUT /api/v1/reviews/{reviewId} — 리뷰 수정 (200 / 409=답글잠금, multipart/form-data).
   * 유지할 기존 사진(http URL)은 request.keepImageUrls 로, 새 사진은 photos File 파트로 분리 전송.
   * 최종 사진 = keepImageUrls + 새 업로드 URL (BE 가 현재 리뷰에 없는 keepUrl 은 무시).
   * tags: FE 한국어 라벨 → BE enum 코드 변환 후 전송.
   */
  async updateReview(reviewId: string, payload: UpdateReviewPayload): Promise<MyReview> {
    const keepImageUrls = payload.photos
      .filter((photo): photo is Extract<ReviewPhoto, { kind: 'existing' }> => photo.kind === 'existing')
      .map((photo) => photo.url)
    const form = buildReviewForm(
      {
        rating: payload.rating,
        content: payload.content.trim(),
        tags: toTagCodes(payload.tags),
        keepImageUrls,
      },
      payload.photos,
    )
    const { data } = await apiClient.put(`/reviews/${reviewId}`, form, MULTIPART_HEADERS)
    return mapToMyReview(myReviewResponseSchema.parse(data))
  },

  /** DELETE /api/v1/reviews/{reviewId} — 리뷰 삭제 (204 / 409=답글잠금) */
  async deleteReview(reviewId: string): Promise<void> {
    await apiClient.delete(`/reviews/${reviewId}`)
  },
}
