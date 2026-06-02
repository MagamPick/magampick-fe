import { describe, it, expect, beforeEach } from 'vitest'
import type { ReactNode } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { NotificationSettingsPage } from './NotificationSettingsPage'
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
  return render(<NotificationSettingsPage />, { wrapper })
}

describe('NotificationSettingsPage (알림 설정)', () => {
  beforeEach(() => __resetNotificationsForTest())

  it('토글 6종을 기본 상태로 보여준다', async () => {
    renderPage()
    await waitFor(() =>
      expect(screen.getByRole('switch', { name: '주변 떨이' })).toHaveAttribute(
        'aria-checked',
        'true',
      ),
    )
    expect(screen.getByRole('switch', { name: '마케팅 정보' })).toHaveAttribute(
      'aria-checked',
      'false',
    )
    expect(screen.getAllByRole('switch')).toHaveLength(6)
  })

  it('꺼진 토글을 켜면 상태가 바뀐다', async () => {
    const user = userEvent.setup()
    renderPage()
    // 설정 로드 완료까지 대기(기본 ON 토글 확인)
    await waitFor(() =>
      expect(screen.getByRole('switch', { name: '주변 떨이' })).toHaveAttribute(
        'aria-checked',
        'true',
      ),
    )
    const marketing = screen.getByRole('switch', { name: '마케팅 정보' })
    expect(marketing).toHaveAttribute('aria-checked', 'false')

    await user.click(marketing)
    await waitFor(() => expect(marketing).toHaveAttribute('aria-checked', 'true'))
  })
})
