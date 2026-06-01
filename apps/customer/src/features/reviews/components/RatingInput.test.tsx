import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RatingInput } from './RatingInput'

describe('RatingInput', () => {
  it('별_클릭_시_해당_점수_onChange', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<RatingInput value={0} onChange={onChange} />)

    await user.click(screen.getByRole('radio', { name: '4점' }))
    expect(onChange).toHaveBeenCalledWith(4)
  })

  it('미선택_시_안내문구', () => {
    render(<RatingInput value={0} onChange={() => {}} />)
    expect(screen.getByText('별점을 선택해 주세요')).toBeInTheDocument()
  })

  it('선택_시_점수_라벨', () => {
    render(<RatingInput value={5} onChange={() => {}} />)
    expect(screen.getByText('최고예요')).toBeInTheDocument()
  })
})
