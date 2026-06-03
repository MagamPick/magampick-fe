import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { BenefitSection } from './BenefitSection'

const baseProps = {
  selectedCoupon: null,
  couponApplicable: false,
  couponDiscount: 0,
  onOpenCoupon: vi.fn(),
  pointInput: 0,
  pointBalance: 2450,
  pointCap: 2450,
  onPointChange: vi.fn(),
  onUseAllPoints: vi.fn(),
}

describe('BenefitSection', () => {
  it('쿠폰 미선택 시 "선택 안 함" 표시, 쿠폰 행 클릭 시 onOpenCoupon 호출', async () => {
    const onOpenCoupon = vi.fn()
    render(<BenefitSection {...baseProps} onOpenCoupon={onOpenCoupon} />)
    expect(screen.getByText('선택 안 함')).toBeInTheDocument()
    await userEvent.click(screen.getByText('쿠폰'))
    expect(onOpenCoupon).toHaveBeenCalled()
  })

  it('포인트 입력 시 onPointChange 를 숫자로 호출', async () => {
    const onPointChange = vi.fn()
    render(<BenefitSection {...baseProps} onPointChange={onPointChange} />)
    await userEvent.type(screen.getByLabelText('사용 포인트'), '5')
    expect(onPointChange).toHaveBeenCalledWith(5)
  })

  it('모두 사용 클릭 시 onUseAllPoints 호출', async () => {
    const onUseAllPoints = vi.fn()
    render(<BenefitSection {...baseProps} onUseAllPoints={onUseAllPoints} />)
    await userEvent.click(screen.getByRole('button', { name: '모두 사용' }))
    expect(onUseAllPoints).toHaveBeenCalled()
  })

  it('보유 포인트를 원 단위로 표시', () => {
    render(<BenefitSection {...baseProps} pointBalance={2450} />)
    expect(screen.getByText('2,450원')).toBeInTheDocument()
  })
})
