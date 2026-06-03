import { describe, it, expect, beforeEach } from 'vitest'
import { ApiError } from '@/shared/lib/apiError'
import { reviewsApi, resetReviewsForTest } from './reviewsApi'

beforeEach(() => {
  resetReviewsForTest()
})

/** seed 에 미작성 완료주문이 최소 1개 있다는 가정 — id 추출 헬퍼 */
async function firstUnreviewedOrderId() {
  const orders = await reviewsApi.listReviewableOrders()
  const target = orders.find((o) => !o.reviewed)
  if (!target) throw new Error('seed 에 미작성 완료주문이 없음')
  return target.orderId
}

describe('reviewsApi', () => {
  it('작성_성공_내리뷰_목록_최신순_추가', async () => {
    const before = await reviewsApi.listMyReviews()
    const orderId = await firstUnreviewedOrderId()

    const created = await reviewsApi.createReview({
      orderId,
      rating: 5,
      content: '맛있어요',
      tags: ['맛있어요'],
      photos: [],
    })

    expect(created.rating).toBe(5)
    expect(created.content).toBe('맛있어요')
    const after = await reviewsApi.listMyReviews()
    expect(after).toHaveLength(before.length + 1)
    expect(after[0].id).toBe(created.id) // 최신순 — 새 리뷰가 맨 앞
  })

  it('작성_후_해당_완료주문_reviewed_true', async () => {
    const orderId = await firstUnreviewedOrderId()
    const created = await reviewsApi.createReview({
      orderId,
      rating: 4,
      content: '',
      tags: [],
      photos: [],
    })

    const orders = await reviewsApi.listReviewableOrders()
    const updated = orders.find((o) => o.orderId === orderId)
    expect(updated?.reviewed).toBe(true)
    expect(updated?.reviewId).toBe(created.id)
  })

  it('이미_리뷰한_주문_재작성_거부', async () => {
    const orderId = await firstUnreviewedOrderId()
    await reviewsApi.createReview({ orderId, rating: 4, content: '', tags: [], photos: [] })

    await expect(
      reviewsApi.createReview({ orderId, rating: 3, content: '', tags: [], photos: [] }),
    ).rejects.toBeInstanceOf(ApiError)
  })

  it('별점_1_미만이면_거부', async () => {
    const orderId = await firstUnreviewedOrderId()
    await expect(
      reviewsApi.createReview({ orderId, rating: 0, content: '', tags: [], photos: [] }),
    ).rejects.toBeInstanceOf(ApiError)
  })

  it('별점_5_초과면_거부', async () => {
    const orderId = await firstUnreviewedOrderId()
    await expect(
      reviewsApi.createReview({ orderId, rating: 6, content: '', tags: [], photos: [] }),
    ).rejects.toBeInstanceOf(ApiError)
  })

  it('후기_300자_초과_거부', async () => {
    const orderId = await firstUnreviewedOrderId()
    await expect(
      reviewsApi.createReview({ orderId, rating: 3, content: 'ㄱ'.repeat(301), tags: [], photos: [] }),
    ).rejects.toBeInstanceOf(ApiError)
  })

  it('사진_3장_초과_거부', async () => {
    const orderId = await firstUnreviewedOrderId()
    await expect(
      reviewsApi.createReview({
        orderId,
        rating: 3,
        content: '',
        tags: [],
        photos: ['a', 'b', 'c', 'd'],
      }),
    ).rejects.toBeInstanceOf(ApiError)
  })

  it('getReviewByOrder_작성전_null_작성후_리뷰', async () => {
    const orderId = await firstUnreviewedOrderId()
    expect(await reviewsApi.getReviewByOrder(orderId)).toBeNull()

    const created = await reviewsApi.createReview({
      orderId,
      rating: 5,
      content: '',
      tags: [],
      photos: [],
    })
    const found = await reviewsApi.getReviewByOrder(orderId)
    expect(found?.id).toBe(created.id)
  })

  it('수정_성공_내용_반영', async () => {
    const editable = (await reviewsApi.listMyReviews()).find((r) => r.ownerReply === null)
    if (!editable) throw new Error('seed 에 답글 없는 리뷰가 없음')

    const updated = await reviewsApi.updateReview(editable.id, {
      rating: 2,
      content: '수정된 후기',
      tags: ['신선해요'],
      photos: [],
    })
    expect(updated.content).toBe('수정된 후기')
    expect(updated.rating).toBe(2)
  })

  it('답글_달린_리뷰_수정_거부', async () => {
    const locked = (await reviewsApi.listMyReviews()).find((r) => r.ownerReply !== null)
    if (!locked) throw new Error('seed 에 답글 달린 리뷰가 없음')

    await expect(
      reviewsApi.updateReview(locked.id, { rating: 1, content: 'x', tags: [], photos: [] }),
    ).rejects.toBeInstanceOf(ApiError)
  })

  it('답글_달린_리뷰_삭제_거부', async () => {
    const locked = (await reviewsApi.listMyReviews()).find((r) => r.ownerReply !== null)
    if (!locked) throw new Error('seed 에 답글 달린 리뷰가 없음')

    await expect(reviewsApi.deleteReview(locked.id)).rejects.toBeInstanceOf(ApiError)
  })

  it('삭제_성공_목록에서_제외', async () => {
    const editable = (await reviewsApi.listMyReviews()).find((r) => r.ownerReply === null)
    if (!editable) throw new Error('seed 에 답글 없는 리뷰가 없음')

    await reviewsApi.deleteReview(editable.id)
    const after = await reviewsApi.listMyReviews()
    expect(after.find((r) => r.id === editable.id)).toBeUndefined()
  })
})
