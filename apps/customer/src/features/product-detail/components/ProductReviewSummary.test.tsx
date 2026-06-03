import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProductReviewSummary } from './ProductReviewSummary'

describe('ProductReviewSummary', () => {
  it('리뷰있음_평점_개수_표시_탭하면_onTap', async () => {
    const onTap = vi.fn()
    render(<ProductReviewSummary rating={4.8} reviewCount={36} onTap={onTap} />)

    expect(screen.getByText('4.8')).toBeInTheDocument()
    expect(screen.getByText(/리뷰 36개/)).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button'))
    expect(onTap).toHaveBeenCalledOnce()
  })

  it('리뷰0건_안내문구', () => {
    render(<ProductReviewSummary rating={0} reviewCount={0} onTap={() => {}} />)
    expect(screen.getByText('아직 리뷰 없어요')).toBeInTheDocument()
  })
})
