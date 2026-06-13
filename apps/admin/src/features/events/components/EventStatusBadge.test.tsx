import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EventStatusBadge } from './EventStatusBadge'

describe('EventStatusBadge', () => {
  it('scheduled → 예정', () => {
    render(<EventStatusBadge status="scheduled" />)
    expect(screen.getByText('예정')).toBeInTheDocument()
  })
  it('ongoing → 진행중', () => {
    render(<EventStatusBadge status="ongoing" />)
    expect(screen.getByText('진행중')).toBeInTheDocument()
  })
  it('ended → 종료', () => {
    render(<EventStatusBadge status="ended" />)
    const el = screen.getByText('종료')
    expect(el).toBeInTheDocument()
    expect(el).toHaveAttribute('data-status', 'ended')
  })
})
