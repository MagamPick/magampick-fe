import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { OrderStepper } from './OrderStepper'

describe('OrderStepper', () => {
  it('COMPLETED면 3단계 모두 완료로 표시한다', () => {
    render(<OrderStepper status="COMPLETED" />)
    expect(screen.getByText('결제 완료')).toBeInTheDocument()
    expect(screen.getByText('픽업 대기')).toBeInTheDocument()
    expect(screen.getByText('픽업 완료')).toBeInTheDocument()
  })

  it('PENDING이면 1단계만 활성이다', () => {
    const { container } = render(<OrderStepper status="PENDING" />)
    const steps = container.querySelectorAll('[data-step]')
    expect(steps[0].getAttribute('data-done')).toBe('true')
    expect(steps[1].getAttribute('data-done')).toBeFalsy()
    expect(steps[2].getAttribute('data-done')).toBeFalsy()
  })

  it('CANCELLED이면 종료 라벨을 표시한다', () => {
    render(<OrderStepper status="CANCELLED" />)
    expect(screen.getByText('취소됨')).toBeInTheDocument()
  })

  it('REJECTED이면 종료 라벨을 표시한다', () => {
    render(<OrderStepper status="REJECTED" />)
    expect(screen.getByText('취소됨')).toBeInTheDocument()
  })
})
