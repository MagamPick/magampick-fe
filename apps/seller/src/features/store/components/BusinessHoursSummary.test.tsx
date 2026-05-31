import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { BusinessHoursSummary } from './BusinessHoursSummary'
import type { BusinessHour } from '../types'

const hours: BusinessHour[] = [{ day: 'mon', openTime: '09:00', closeTime: '21:00' }]

describe('BusinessHoursSummary — 읽기전용 주간 요약', () => {
  it('영업일은 시간, 나머지는 "휴무" 로 7행 표시', () => {
    render(<BusinessHoursSummary hours={hours} />)
    expect(screen.getByText('09:00 – 21:00')).toBeInTheDocument()
    expect(screen.getAllByText('휴무').length).toBe(6)
  })
})
