import { describe, it, expect, beforeEach } from 'vitest'
import type { ReactNode } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { NotificationCenterPage } from './NotificationCenterPage'
import { __resetNotificationsForTest } from '../api/notificationsApi'

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
  beforeEach(() => __resetNotificationsForTest())

  it('알림 목록을 단일 리스트로 보여준다', async () => {
    renderPage()
    expect(await screen.findByText('새 주문이 들어왔어요')).toBeInTheDocument()
    expect(screen.getByText('새 리뷰가 등록되었어요')).toBeInTheDocument()
  })

  it('[모두 읽음]을 누르면 미읽음 표시가 사라진다', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('새 주문이 들어왔어요')
    expect(screen.getAllByText('읽지 않음').length).toBeGreaterThan(0)

    await user.click(screen.getByRole('button', { name: '모두 읽음' }))
    await waitFor(() => expect(screen.queryByText('읽지 않음')).not.toBeInTheDocument())
  })
})
