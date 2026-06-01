import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ReviewSummaryHeader } from './ReviewSummaryHeader'

describe('ReviewSummaryHeader', () => {
  it('평균_총개수_답글률_표시', () => {
    render(<ReviewSummaryHeader summary={{ average: 4.5, total: 128, replyRate: 86 }} />)
    expect(screen.getByText('4.5')).toBeInTheDocument()
    expect(screen.getByText(/총 128개 리뷰/)).toBeInTheDocument()
    expect(screen.getByText(/답글률 86%/)).toBeInTheDocument()
  })
})
