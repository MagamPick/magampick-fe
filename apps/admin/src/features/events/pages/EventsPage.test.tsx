import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EventsPage } from './EventsPage'
import { createQueryWrapper } from '@/shared/test/queryWrapper'
import { eventApi } from '../api/eventApi'
import type { EventView } from '../types'

vi.mock('../api/eventApi')

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

function renderPage() {
  render(<EventsPage />, { wrapper: createQueryWrapper() })
}

beforeEach(() => vi.clearAllMocks())

describe('EventsPage', () => {
  it('빈 목록이면 EmptyState 노출', async () => {
    vi.mocked(eventApi.listEvents).mockResolvedValue([])
    renderPage()
    expect(await screen.findByText('등록된 이벤트가 없어요')).toBeInTheDocument()
  })

  it('목록이 있으면 테이블 렌더', async () => {
    vi.mocked(eventApi.listEvents).mockResolvedValue([ongoing])
    renderPage()
    expect(await screen.findByText('진행 쿠폰')).toBeInTheDocument()
    expect(screen.getByText('진행중')).toBeInTheDocument()
  })

  it('조회 실패 시 ErrorState(다시 시도) 노출', async () => {
    vi.mocked(eventApi.listEvents).mockRejectedValue(new Error('boom'))
    renderPage()
    expect(await screen.findByRole('button', { name: '다시 시도' })).toBeInTheDocument()
  })

  it('[새 이벤트] 클릭 시 생성 모달이 열린다', async () => {
    vi.mocked(eventApi.listEvents).mockResolvedValue([])
    renderPage()
    await screen.findByText('등록된 이벤트가 없어요')
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: '새 이벤트' }))
    // 생성 폼의 제출 버튼은 모달에만 존재
    expect(await screen.findByRole('button', { name: '이벤트 생성' })).toBeInTheDocument()
  })
})
