import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { DealCard } from './DealCard'

describe('DealCard', () => {
  it('정가·할인율·할인가, 판매 진행, 마감 시각을 보여준다', () => {
    render(
      <DealCard
        name="버터 크루아상"
        originalPrice={4000}
        salePrice={2000}
        soldCount={12}
        totalQty={20}
        closeTime="21:00"
        status="live"
      />,
    )
    expect(screen.getByText('버터 크루아상')).toBeInTheDocument()
    expect(screen.getByText('₩4,000')).toBeInTheDocument()
    expect(screen.getByText('₩2,000')).toBeInTheDocument()
    expect(screen.getByText('50%')).toBeInTheDocument()
    expect(screen.getByText(/12 \/ 20 판매/)).toBeInTheDocument()
    expect(screen.getByText('마감 21:00')).toBeInTheDocument()
  })

  it('곧 마감(soon)이면 마감 시각 대신 "곧 마감"', () => {
    render(
      <DealCard
        name="우유 식빵"
        originalPrice={5500}
        salePrice={2750}
        soldCount={5}
        totalQty={8}
        closeTime="19:30"
        status="soon"
      />,
    )
    expect(screen.getByText('곧 마감')).toBeInTheDocument()
  })
})
