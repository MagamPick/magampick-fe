import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { ReactNode } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { NotificationCenterPage } from './NotificationCenterPage'

vi.mock('@/shared/lib/axios')

import { apiClient } from '@/shared/lib/axios'

const beNotifications = [
  {
    id: 1,
    category: 'order',
    title: '새 주문이 들어왔어요',
    body: '빵순이님',
    createdAt: '2026-06-11T10:05:00.000Z',
    read: false,
    link: '/orders',
  },
  {
    id: 2,
    category: 'review',
    title: '새 리뷰가 등록되었어요',
    body: '라라님이',
    createdAt: '2026-06-11T09:00:00.000Z',
    read: false,
    link: '/reviews',
  },
]

function renderPage() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false } },
  })
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  )
  return render(<NotificationCenterPage />, { wrapper })
}

describe('NotificationCenterPage (사장 알림센터)', () => {
  beforeEach(() => vi.clearAllMocks())

  it('알림 목록을 단일 리스트로 보여준다', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: { items: beNotifications } })
    renderPage()
    expect(await screen.findByText('새 주문이 들어왔어요')).toBeInTheDocument()
    expect(screen.getByText('새 리뷰가 등록되었어요')).toBeInTheDocument()
  })

  it('[모두 읽음]을 누르면 미읽음 표시가 사라진다', async () => {
    const user = userEvent.setup()
    vi.mocked(apiClient.get)
      .mockResolvedValueOnce({ data: { items: beNotifications } }) // 초기 로드
      .mockResolvedValue({
        data: { items: beNotifications.map((n) => ({ ...n, read: true })) },
      }) // 재조회(읽음 처리 후)
    vi.mocked(apiClient.patch).mockResolvedValue({})

    renderPage()
    await screen.findByText('새 주문이 들어왔어요')
    expect(screen.getAllByText('읽지 않음').length).toBeGreaterThan(0)

    await user.click(screen.getByRole('button', { name: '모두 읽음' }))
    await waitFor(() => expect(screen.queryByText('읽지 않음')).not.toBeInTheDocument())
  })
})
