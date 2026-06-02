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

describe('NotificationCenterPage (알림센터)', () => {
  beforeEach(() => __resetNotificationsForTest())

  it('알림 목록을 보여준다', async () => {
    renderPage()
    expect(await screen.findByText('단골 가게의 새 마감 할인!')).toBeInTheDocument()
  })

  it('세그먼트를 바꾸면 해당 종류만 보인다', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('단골 가게의 새 마감 할인!')

    await user.click(screen.getByRole('tab', { name: '주문' }))
    // 세그먼트 전환 → 새 쿼리 로드 완료까지 대기
    expect(await screen.findByText('주문이 픽업 대기 중이에요')).toBeInTheDocument()
    expect(screen.queryByText('단골 가게의 새 마감 할인!')).not.toBeInTheDocument()
  })

  it('[모두 읽음]을 누르면 미읽음 표시가 사라진다', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('단골 가게의 새 마감 할인!')
    expect(screen.getAllByText('읽지 않음').length).toBeGreaterThan(0)

    await user.click(screen.getByRole('button', { name: '모두 읽음' }))
    await waitFor(() => expect(screen.queryByText('읽지 않음')).not.toBeInTheDocument())
  })
})
