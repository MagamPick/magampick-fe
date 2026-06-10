import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { ReactNode } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { NotificationSettingsPage } from './NotificationSettingsPage'

vi.mock('@/shared/lib/axios')

import { apiClient } from '@/shared/lib/axios'

const beSettings = {
  newOrder: true,
  orderCancel: true,
  refundRequest: true,
  newReview: true,
  notice: true,
  marketing: false,
}

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

describe('NotificationSettingsPage (사장 알림 설정)', () => {
  beforeEach(() => vi.clearAllMocks())

  it('토글 6종을 기본 상태로 보여준다', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: beSettings })
    renderPage()
    await waitFor(() =>
      expect(screen.getByRole('switch', { name: '신규 주문' })).toHaveAttribute(
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
    // 초기 GET → 원본 설정; onSettled invalidation 후 재조회 → 업데이트된 설정
    vi.mocked(apiClient.get)
      .mockResolvedValueOnce({ data: beSettings })
      .mockResolvedValue({ data: { ...beSettings, marketing: true } })
    vi.mocked(apiClient.patch).mockResolvedValue({ data: { ...beSettings, marketing: true } })
    renderPage()
    await waitFor(() =>
      expect(screen.getByRole('switch', { name: '신규 주문' })).toHaveAttribute(
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
