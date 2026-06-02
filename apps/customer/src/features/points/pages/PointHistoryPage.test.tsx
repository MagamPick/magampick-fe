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
      { id: 't1', reason: 'earn', amount: 120, storeName: '브레드샵', date: '2026-05-28' },
    ])

    renderPage()

    expect(await screen.findByText('2,450')).toBeInTheDocument()
    expect(await screen.findByText('결제 적립 · 브레드샵')).toBeInTheDocument()
  })

  it('내역이 없으면 빈 상태', async () => {
    vi.mocked(pointApi.getSummary).mockResolvedValue({ balance: 0 })
    vi.mocked(pointApi.listHistory).mockResolvedValue([])

    renderPage()

    expect(await screen.findByText(/해당 내역이 없어요/)).toBeInTheDocument()
  })
})
