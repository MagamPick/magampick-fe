import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { ReactNode } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { NotificationCenterPage } from './NotificationCenterPage'

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

const makeItem = (id: number, category: string, title: string, read = false) => ({
  id,
  category,
  title,
  body: '본문',
  createdAt: new Date().toISOString(),
  read,
  link: null,
})

const allItems = [
  makeItem(1, 'deal', '단골 가게의 새 마감 할인!', false),
  makeItem(2, 'order', '주문이 픽업 대기 중이에요', false),
  makeItem(3, 'system', '서비스 안내', true),
]
const dealItems = [makeItem(1, 'deal', '단골 가게의 새 마감 할인!', false)]
const orderItems = [makeItem(2, 'order', '주문이 픽업 대기 중이에요', false)]

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
  return render(<NotificationCenterPage />, { wrapper })
}

beforeEach(() => vi.clearAllMocks())

describe('NotificationCenterPage (알림센터)', () => {
  it('알림 목록을 보여준다', async () => {
    mockedGet.mockResolvedValueOnce({ data: { items: allItems } })

    renderPage()
    expect(await screen.findByText('단골 가게의 새 마감 할인!')).toBeInTheDocument()
  })

  it('세그먼트를 바꾸면 해당 종류만 보인다', async () => {
    const user = userEvent.setup()
    // 첫 로드(all) + 탭 전환(order) 순서로 목 세팅
    mockedGet
      .mockResolvedValueOnce({ data: { items: allItems } })
      .mockResolvedValueOnce({ data: { items: orderItems } })

    renderPage()
    await screen.findByText('단골 가게의 새 마감 할인!')

    await user.click(screen.getByRole('tab', { name: '주문' }))
    expect(await screen.findByText('주문이 픽업 대기 중이에요')).toBeInTheDocument()
    expect(screen.queryByText('단골 가게의 새 마감 할인!')).not.toBeInTheDocument()
  })

  it('[모두 읽음]을 누르면 미읽음 표시가 사라진다', async () => {
    const user = userEvent.setup()
    // 초기 목록 로드
    mockedGet.mockResolvedValueOnce({ data: { items: allItems } })
    // markAllRead PATCH 후 invalidate → 재조회 시 모두 read:true
    mockedPatch.mockResolvedValueOnce({ data: null })
    mockedGet.mockResolvedValue({ data: { items: allItems.map((n) => ({ ...n, read: true })) } })

    renderPage()
    await screen.findByText('단골 가게의 새 마감 할인!')
    expect(screen.getAllByText('읽지 않음').length).toBeGreaterThan(0)

    await user.click(screen.getByRole('button', { name: '모두 읽음' }))
    await waitFor(() => expect(screen.queryByText('읽지 않음')).not.toBeInTheDocument())
  })

  it('deal 탭과 order 탭에서 각각 올바른 segment 로 API 호출', async () => {
    const user = userEvent.setup()
    mockedGet
      .mockResolvedValueOnce({ data: { items: allItems } })
      .mockResolvedValueOnce({ data: { items: dealItems } })
      .mockResolvedValueOnce({ data: { items: orderItems } })

    renderPage()
    await screen.findByText('단골 가게의 새 마감 할인!')

    await user.click(screen.getByRole('tab', { name: '마감 할인' }))
    await screen.findByText('단골 가게의 새 마감 할인!')

    await user.click(screen.getByRole('tab', { name: '주문' }))
    await screen.findByText('주문이 픽업 대기 중이에요')

    // all → params undefined, deal → params {segment:'deal'}, order → params {segment:'order'}
    expect(mockedGet).toHaveBeenNthCalledWith(1, '/customers/me/notifications', { params: undefined })
    expect(mockedGet).toHaveBeenNthCalledWith(2, '/customers/me/notifications', { params: { segment: 'deal' } })
    expect(mockedGet).toHaveBeenNthCalledWith(3, '/customers/me/notifications', { params: { segment: 'order' } })
  })
})
