import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SectionHeader } from './SectionHeader'

const mockNavigate = vi.fn()
vi.mock('react-router', async (orig) => ({
  ...(await orig<typeof import('react-router')>()),
  useNavigate: () => mockNavigate,
}))

describe('SectionHeader', () => {
  beforeEach(() => mockNavigate.mockClear())

  it('더보기_클릭시_지정_경로로_이동', async () => {
    const user = userEvent.setup()
    render(<SectionHeader title="마감 임박" moreTo="/all" />)

    await user.click(screen.getByRole('button', { name: '더보기' }))

    expect(mockNavigate).toHaveBeenCalledWith('/all')
  })

  it('moreTo_없으면_더보기_버튼_없음', () => {
    render(<SectionHeader title="마감 임박" />)
    expect(screen.queryByRole('button', { name: '더보기' })).not.toBeInTheDocument()
  })
})
