import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ReviewPanel } from './ReviewPanel'
import type { ReviewMetrics } from '../types'

const review: ReviewMetrics = {
  avgRating: 4.8,
  newCount: 14,
  replyRate: 79,
  tags: [
    { tag: '맛있어요', count: 7 },
    { tag: '신선해요', count: 8 },
    { tag: '친절해요', count: 9 },
    { tag: '재구매', count: 6 },
    { tag: '양 많아요', count: 5 },
    { tag: '가성비', count: 0 },
    { tag: '픽업 빨라요', count: 3 },
  ],
}

describe('ReviewPanel', () => {
  it('평균 별점·신규 리뷰·답글률을 보여준다', () => {
    render(<ReviewPanel review={review} />)
    expect(screen.getByText('4.8')).toBeInTheDocument()
    expect(screen.getByText('14건')).toBeInTheDocument()
    expect(screen.getByText('79%')).toBeInTheDocument()
  })

  it('빠른평가 태그를 카운트 내림차순 상위 5개만(카운트와 함께) 보여준다', () => {
    render(<ReviewPanel review={review} />)
    // 상위 5: 친절(9)·신선(8)·맛있(7)·재구매(6)·양많(5). 픽업(3)·가성비(0) 제외
    expect(screen.getByText('# 친절해요 9')).toBeInTheDocument()
    expect(screen.getByText('# 양 많아요 5')).toBeInTheDocument()
    expect(screen.queryByText(/가성비/)).not.toBeInTheDocument()
    expect(screen.queryByText(/픽업 빨라요/)).not.toBeInTheDocument()
  })
})
