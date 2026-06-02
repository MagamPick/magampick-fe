import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { FeeGuideCard } from './FeeGuideCard'

describe('FeeGuideCard', () => {
  it('중개·결제 수수료율과 정산 주기를 안내한다', () => {
    render(<FeeGuideCard />)
    expect(screen.getByText('수수료 안내')).toBeInTheDocument()
    expect(screen.getByText('중개 수수료')).toBeInTheDocument()
    expect(screen.getByText('결제액의 5.0%')).toBeInTheDocument()
    expect(screen.getByText('결제 수수료')).toBeInTheDocument()
    expect(screen.getByText('결제액의 1.5%')).toBeInTheDocument()
    expect(screen.getByText('정산 주기')).toBeInTheDocument()
    expect(screen.getByText('월 2회 · 15일·말일 마감')).toBeInTheDocument()
  })
})
