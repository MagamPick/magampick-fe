import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EventsTable } from './EventsTable'
import type { EventView } from '../types'

const ongoing: EventView = {
  id: 1,
  label: '진행 쿠폰',
  discountType: 'RATE',
  value: 10,
  minOrder: 10000,
  validUntil: '2026-07-31',
  issueLimit: 100,
  issuedCount: 3,
  active: true,
  displayStartAt: '2026-06-20',
  displayEndAt: '2026-07-20',
  status: 'ongoing',
}

const ended: EventView = {
  id: 2,
  label: '종료 쿠폰',
  discountType: 'AMOUNT',
  value: 2000,
  minOrder: 0,
  validUntil: '2026-05-31',
  issueLimit: null,
  issuedCount: 5,
  active: false,
  displayStartAt: '2026-05-01',
  displayEndAt: '2026-05-20',
  status: 'ended',
}

describe('EventsTable', () => {
  it('할인 표기 — RATE %, AMOUNT 원', () => {
    render(<EventsTable events={[ongoing, ended]} onEdit={vi.fn()} onEnd={vi.fn()} />)
    expect(screen.getByText('10%')).toBeInTheDocument()
    expect(screen.getByText('2,000원')).toBeInTheDocument()
  })

  it('발급 표기 — 선착순 n/limit, 무제한 ∞', () => {
    render(<EventsTable events={[ongoing, ended]} onEdit={vi.fn()} onEnd={vi.fn()} />)
    expect(screen.getByText('3 / 100')).toBeInTheDocument()
    expect(screen.getByText('5 / ∞')).toBeInTheDocument()
  })

  it('상태 배지 노출', () => {
    render(<EventsTable events={[ongoing, ended]} onEdit={vi.fn()} onEnd={vi.fn()} />)
    expect(screen.getByText('진행중')).toBeInTheDocument()
    expect(screen.getByText('종료')).toBeInTheDocument()
  })

  it('ended 행은 수정·조기종료 비활성', () => {
    render(<EventsTable events={[ongoing, ended]} onEdit={vi.fn()} onEnd={vi.fn()} />)
    const editButtons = screen.getAllByRole('button', { name: '수정' })
    const endButtons = screen.getAllByRole('button', { name: '조기종료' })
    // events 순서: [ongoing, ended]
    expect(editButtons[0]).toBeEnabled()
    expect(editButtons[1]).toBeDisabled()
    expect(endButtons[1]).toBeDisabled()
  })

  it('수정/조기종료 클릭 시 해당 이벤트로 콜백', async () => {
    const onEdit = vi.fn()
    const onEnd = vi.fn()
    render(<EventsTable events={[ongoing, ended]} onEdit={onEdit} onEnd={onEnd} />)
    const user = userEvent.setup()
    await user.click(screen.getAllByRole('button', { name: '수정' })[0])
    expect(onEdit).toHaveBeenCalledWith(ongoing)
    await user.click(screen.getAllByRole('button', { name: '조기종료' })[0])
    expect(onEnd).toHaveBeenCalledWith(ongoing)
  })
})
