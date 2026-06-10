import { z } from 'zod'
import { apiClient } from '@/shared/lib/axios'
import type { SellerReview, ReviewSummary } from '../types'

// ─── BE StoreReviewResponse Zod 스키마 ─────────────────────────────────────

const reviewedProductSchema = z.object({
  productId: z.number().optional(),
  kind: z.string().optional(),
  name: z.string().optional(),
})

/**
 * BE StoreReviewResponse Zod 스키마.
 * 전 필드 optional — BE 확장 대비 방어적 파싱.
 * ownerReply 는 답글 없으면 null.
 */
export const storeReviewResponseSchema = z.object({
  id: z.number().optional(),
  authorNickname: z.string().optional(),
  rating: z.number().optional(),
  content: z.string().optional(),
  createdAt: z.string().optional(),
  products: z.array(reviewedProductSchema).optional(),
  photos: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  ownerReply: z.string().nullable().optional(),
})

type StoreReviewResponse = z.infer<typeof storeReviewResponseSchema>

// ─── BE → FE 도메인 매핑 ───────────────────────────────────────────────────

/**
 * BE StoreReviewResponse → FE SellerReview 변환.
 * - id: number → string
 * - products: BE ReviewedProduct[] → { name }[] (FE 는 이름만 표시)
 * - photos·tags: 그대로 전달 (tags 는 한국어 라벨 그대로)
 * - ownerReply: null/undefined → null
 */
export function mapToSellerReview(res: StoreReviewResponse): SellerReview {
  return {
    id: String(res.id ?? 0),
    authorNickname: res.authorNickname ?? '',
    rating: res.rating ?? 0,
    content: res.content ?? '',
    createdAt: res.createdAt ?? new Date().toISOString(),
    products: (res.products ?? []).map((p) => ({ name: p.name ?? '' })),
    photos: res.photos ?? [],
    tags: res.tags ?? [],
    ownerReply: res.ownerReply ?? null,
  }
}

// ─── 요약 파생 (순수 함수) ─────────────────────────────────────────────────

/**
 * 리뷰 목록에서 요약(평균·총개수·답글률)을 파생하는 순수 함수.
 * useReviewSummary 의 select 옵션으로 사용 — 네트워크 1회(list 와 동일 queryKey 디덥).
 */
export function computeReviewSummary(reviews: SellerReview[]): ReviewSummary {
  const total = reviews.length
  if (!total) return { average: 0, total: 0, replyRate: 0 }
  const average =
    Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / total) * 10) / 10
  const replied = reviews.filter((r) => r.ownerReply !== null).length
  return {
    average,
    total,
    replyRate: Math.round((replied / total) * 100),
  }
}

// ─── reviewsApi ────────────────────────────────────────────────────────────

export const reviewsApi = {
  /**
   * 사장 본인 매장 리뷰 목록 — 최신순, 삭제 제외 (BE 정렬).
   * GET /seller/stores/{storeId}/reviews → StoreReviewResponse[]
   */
  async listStoreReviews(storeId: string): Promise<SellerReview[]> {
    const { data } = await apiClient.get(`/seller/stores/${storeId}/reviews`)
    const list = z.array(storeReviewResponseSchema).parse(data)
    return list.map(mapToSellerReview)
  },

  /**
   * 리뷰 답글 작성 — 리뷰당 1개, 중복은 BE 가 거부.
   * POST /seller/reviews/{reviewId}/reply → 답글 채워진 StoreReviewResponse
   */
  async replyToReview(reviewId: string, content: string): Promise<SellerReview> {
    const { data } = await apiClient.post(`/seller/reviews/${reviewId}/reply`, { content })
    return mapToSellerReview(storeReviewResponseSchema.parse(data))
  },
}
