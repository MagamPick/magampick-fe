import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router'
import { PointHistoryPage } from './PointHistoryPage'
import { pointApi } from '../api/pointApi'
import { createQueryWrapper } from '@/shared/test/queryWrapper'

vi.mock('../api/pointApi')

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/mypage/points']}>
      <PointHistoryPage />
    </MemoryRouter>,
    { wrapper: createQueryWrapper() },
  )
}

describe('PointHistoryPage', () => {
  beforeEach(() => vi.clearAllMocks())

  it('잔액과 내역을 표시', async () => {
    vi.mocked(pointApi.getSummary).mockResolvedValue({ balance: 2450 })
    vi.mocked(pointApi.listHistory).mockResolvedValue([
      { id: 1, reason: 'EARN', amount: 120, storeName: '브레드샵', occurredAt: '2026-05-28T10:00:00+09:00' },
    ])

    renderPage()

    expect(await screen.findByText('2,450')).toBeInTheDocument()
    expect(await screen.findByText('결제 적립 · 브레드샵')).toBeInTheDocument()
  })

  it('적립 예정(pendingPoints)이 있으면 Hero에 함께 표시', async () => {
    vi.mocked(pointApi.getSummary).mockResolvedValue({ balance: 2450, pendingPoints: 300 })
    vi.mocked(pointApi.listHistory).mockResolvedValue([])

    renderPage()

    expect(await screen.findByText('적립 예정')).toBeInTheDocument()
    expect(screen.getByText('+300 P')).toBeInTheDocument()
  })

  it('내역이 없으면 빈 상태', async () => {
    vi.mocked(pointApi.getSummary).mockResolvedValue({ balance: 0 })
    vi.mocked(pointApi.listHistory).mockResolvedValue([])

    renderPage()

    expect(await screen.findByText(/해당 내역이 없어요/)).toBeInTheDocument()
  })
})
