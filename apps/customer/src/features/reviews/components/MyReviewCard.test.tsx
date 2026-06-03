import { describe, it, expect, vi } from 'vitest'
import type { ReactElement } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { MyReviewCard } from './MyReviewCard'
import type { MyReview } from '../types'

const base: MyReview = {
  id: 'rv-1',
  storeId: 'st-1',
  storeName: '브레드샵',
  storeEmoji: '🥐',
  items: [
    { productId: 'sd-1', kind: 'deal', name: '크루아상 세트' },
    { productId: 'mn-1', kind: 'menu', name: '플레인 크루아상' },
  ],
  rating: 4,
  content: '맛있어요',
  tags: ['맛있어요'],
  photos: [],
  createdAt: '2026-05-20T10:00:00+09:00',
  ownerReply: null,
}

function renderCard(ui: ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

describe('MyReviewCard', () => {
  it('답글_없으면_수정_삭제_버튼_노출', () => {
    renderCard(<MyReviewCard review={base} onEdit={() => {}} onDelete={() => {}} />)
    expect(screen.getByRole('button', { name: '수정' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '삭제' })).toBeInTheDocument()
  })

  it('답글_있으면_잠금_수정삭제_숨기고_답글_표시', () => {
    renderCard(
      <MyReviewCard
        review={{ ...base, ownerReply: '감사합니다 또 오세요' }}
        onEdit={() => {}}
        onDelete={() => {}}
      />,
    )
    expect(screen.queryByRole('button', { name: '수정' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '삭제' })).not.toBeInTheDocument()
    expect(screen.getByText('사장님 답글')).toBeInTheDocument()
    expect(screen.getByText('감사합니다 또 오세요')).toBeInTheDocument()
  })

  it('구매_상품_각각_상품_상세_링크', () => {
    renderCard(<MyReviewCard review={base} onEdit={() => {}} onDelete={() => {}} />)
    expect(screen.getByRole('link', { name: /크루아상 세트/ })).toHaveAttribute(
      'href',
      '/product/deal/sd-1',
    )
    expect(screen.getByRole('link', { name: /플레인 크루아상/ })).toHaveAttribute(
      'href',
      '/product/menu/mn-1',
    )
  })

  it('수정_클릭_시_onEdit_호출', async () => {
    const onEdit = vi.fn()
    const user = userEvent.setup()
    renderCard(<MyReviewCard review={base} onEdit={onEdit} onDelete={() => {}} />)
    await user.click(screen.getByRole('button', { name: '수정' }))
    expect(onEdit).toHaveBeenCalledWith(base)
  })
})
