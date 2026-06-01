import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SellerReviewCard } from './SellerReviewCard'
import type { SellerReview } from '../types'

const base: SellerReview = {
  id: 'srv-1',
  authorNickname: '빵순이님',
  rating: 5,
  content: '맛있어요',
  createdAt: '2026-05-20T10:00:00+09:00',
  products: [{ name: '크루아상' }],
  photos: [],
  tags: ['신선해요'],
  ownerReply: null,
}

describe('SellerReviewCard', () => {
  it('답글_없으면_답글달기_버튼_노출', () => {
    render(<SellerReviewCard review={base} onReply={() => {}} />)
    expect(screen.getByRole('button', { name: '답글 달기' })).toBeInTheDocument()
  })

  it('답글_있으면_답글_표시하고_버튼_숨김', () => {
    render(
      <SellerReviewCard review={{ ...base, ownerReply: '감사합니다' }} onReply={() => {}} />,
    )
    expect(screen.queryByRole('button', { name: '답글 달기' })).not.toBeInTheDocument()
    expect(screen.getByText('사장님 답글')).toBeInTheDocument()
    expect(screen.getByText('감사합니다')).toBeInTheDocument()
  })

  it('답글달기_클릭_시_onReply_호출', async () => {
    const onReply = vi.fn()
    const user = userEvent.setup()
    render(<SellerReviewCard review={base} onReply={onReply} />)
    await user.click(screen.getByRole('button', { name: '답글 달기' }))
    expect(onReply).toHaveBeenCalledWith(base)
  })
})
