import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { PointHero } from './PointHero'

describe('PointHero', () => {
  it('사용 가능 잔액을 표시', () => {
    render(<PointHero balance={2450} />)
    expect(screen.getByText('사용 가능한 포인트')).toBeInTheDocument()
    expect(screen.getByText('2,450')).toBeInTheDocument()
  })

  it('적립 예정이 있으면 잔액과 별도로 표시 + 3일 후 사용 가능 안내', () => {
    render(<PointHero balance={2450} pendingPoints={300} />)
    expect(screen.getByText('적립 예정')).toBeInTheDocument()
    expect(screen.getByText('+300 P')).toBeInTheDocument()
    expect(screen.getByText(/3일 후 사용 가능/)).toBeInTheDocument()
  })

  it('적립 예정이 0이면 표시하지 않음', () => {
    render(<PointHero balance={2450} pendingPoints={0} />)
    expect(screen.queryByText('적립 예정')).not.toBeInTheDocument()
  })
})
