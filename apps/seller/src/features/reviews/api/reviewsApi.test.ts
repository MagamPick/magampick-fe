import { describe, it, expect, beforeEach } from 'vitest'
import { ApiError } from '@/shared/lib/apiError'
import { reviewsApi, resetReviewsForTest } from './reviewsApi'

beforeEach(() => {
  resetReviewsForTest()
})

describe('reviewsApi (seller)', () => {
  it('매장_리뷰_목록_반환', async () => {
    const list = await reviewsApi.listStoreReviews()
    expect(list.length).toBeGreaterThanOrEqual(1)
  })

  it('요약_평균_총개수_답글률_범위', async () => {
    const summary = await reviewsApi.getReviewSummary()
    expect(summary.total).toBeGreaterThan(0)
    expect(summary.average).toBeGreaterThan(0)
    expect(summary.average).toBeLessThanOrEqual(5)
    expect(summary.replyRate).toBeGreaterThanOrEqual(0)
    expect(summary.replyRate).toBeLessThanOrEqual(100)
  })

  it('답글_작성_성공_ownerReply_설정', async () => {
    const target = (await reviewsApi.listStoreReviews()).find((r) => r.ownerReply === null)
    if (!target) throw new Error('seed 에 답글 없는 리뷰가 없음')

    const updated = await reviewsApi.replyToReview(target.id, '감사합니다!')
    expect(updated.ownerReply).toBe('감사합니다!')

    const after = (await reviewsApi.listStoreReviews()).find((r) => r.id === target.id)
    expect(after?.ownerReply).toBe('감사합니다!')
  })

  it('이미_답글_있는_리뷰_재답글_거부', async () => {
    const replied = (await reviewsApi.listStoreReviews()).find((r) => r.ownerReply !== null)
    if (!replied) throw new Error('seed 에 답글 있는 리뷰가 없음')

    await expect(reviewsApi.replyToReview(replied.id, '또 답글')).rejects.toBeInstanceOf(ApiError)
  })

  it('빈_답글_거부', async () => {
    const target = (await reviewsApi.listStoreReviews()).find((r) => r.ownerReply === null)
    if (!target) throw new Error('seed 에 답글 없는 리뷰가 없음')

    await expect(reviewsApi.replyToReview(target.id, '   ')).rejects.toBeInstanceOf(ApiError)
  })
})
