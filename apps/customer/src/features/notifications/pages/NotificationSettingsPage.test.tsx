import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { ReactNode } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { NotificationSettingsPage } from './NotificationSettingsPage'

vi.mock('@/shared/lib/axios', () => ({
  apiClient: {
    get: vi.fn(),
    patch: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}))

import { apiClient } from '@/shared/lib/axios'
const mockedGet = vi.mocked(apiClient.get)
const mockedPatch = vi.mocked(apiClient.patch)

const defaultSettings = {
  nearbyDeal: true,
  favoriteStore: true,
  orderRefund: true,
  reviewReply: true,
  eventBenefit: false,
  marketing: false,
}

function renderPage() {
  const qc = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: Infinity },
      mutations: { retry: false },
    },
  })
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  )
  return render(<NotificationSettingsPage />, { wrapper })
}

beforeEach(() => vi.clearAllMocks())

describe('NotificationSettingsPage (알림 설정)', () => {
  it('토글 6종을 기본 상태로 보여준다', async () => {
    // sticky mock — staleTime:Infinity지만 gc/refetch 경우를 대비
    mockedGet.mockResolvedValue({ data: defaultSettings })

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
    // 초기 로드 → defaultSettings. mutation+invalidate 후 refetch → marketing:true 반환
    mockedGet
      .mockResolvedValueOnce({ data: defaultSettings })
      .mockResolvedValue({ data: { ...defaultSettings, marketing: true } })
    mockedPatch.mockResolvedValueOnce({
      data: { ...defaultSettings, marketing: true },
    })

    renderPage()
    // 설정 로드 완료까지 대기
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
