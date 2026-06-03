import { describe, it, expect } from 'vitest'
import type { ReactElement } from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { MyReviewList } from './MyReviewList'
import type { MyReview } from '../types'

const review = (id: string, rating: number): MyReview => ({
  id,
  storeId: 's',
  storeName: '가게',
  storeEmoji: '🥐',
  items: [{ productId: 'p1', kind: 'menu', name: '빵' }],
  rating,
  content: '',
  tags: [],
  photos: [],
  createdAt: '2026-05-20T10:00:00+09:00',
  ownerReply: null,
})

function renderList(ui: ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

describe('MyReviewList', () => {
  it('빈_목록_안내_문구', () => {
    renderList(<MyReviewList reviews={[]} onEdit={() => {}} onDelete={() => {}} />)
    expect(screen.getByText('작성한 리뷰가 없어요.')).toBeInTheDocument()
  })

  it('요약_개수와_평균_표시', () => {
    renderList(
      <MyReviewList
        reviews={[review('a', 5), review('b', 3)]}
        onEdit={() => {}}
        onDelete={() => {}}
      />,
    )
    expect(screen.getByText('2')).toBeInTheDocument() // 작성 개수
    expect(screen.getByText('4.0')).toBeInTheDocument() // 평균 (5+3)/2
  })
})
