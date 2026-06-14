import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useStoreList } from '../hooks/useStoreList'
import { useUnreadCount } from '@/features/notifications/hooks/useUnreadCount'
import { ROUTES } from '@/shared/lib/routes'
import { StoreListPage } from './StoreListPage'

vi.mock('../hooks/useStoreList')
vi.mock('@/features/notifications/hooks/useUnreadCount')
vi.mock('../hooks/useStoreListRefresh', () => ({ useStoreListRefresh: () => () => {} }))
vi.mock('@/shared/components/PullToRefresh', () => ({
  PullToRefresh: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))
vi.mock('../components/StoreListCard', () => ({
  StoreListCard: ({ store }: { store: { id: number } }) => (
    <div data-testid="store-card">{store.id}</div>
  ),
}))

function mockStoreList(overrides: Record<string, unknown>) {
  vi.mocked(useStoreList).mockReturnValue({
    data: undefined,
    isPending: false,
    isError: false,
    hasNextPage: false,
    isFetchingNextPage: false,
    fetchNextPage: vi.fn(),
    refetch: vi.fn(),
    ...overrides,
  } as unknown as ReturnType<typeof useStoreList>)
}

const onePage = (items: { id: number }[]) => ({
  pages: [{ items, total: items.length, dealStoreCount: 0 }],
  pageParams: [undefined],
})

function renderPage() {
  return render(
    <MemoryRouter>
      <StoreListPage />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(useUnreadCount).mockReturnValue({
    data: 0,
  } as unknown as ReturnType<typeof useUnreadCount>)
})

describe('StoreListPage 상태 분기', () => {
  it('로딩 중이면 스켈레톤을 노출', () => {
    mockStoreList({ isPending: true })
    const { container } = renderPage()
    expect(container.querySelectorAll('[data-slot="skeleton-row"]').length).toBeGreaterThan(0)
  })

  it('에러면 ErrorState 를 노출하고 다시 시도가 refetch 를 호출', async () => {
    const refetch = vi.fn()
    mockStoreList({ isError: true, refetch })
    renderPage()
    expect(
      screen.getByText('지금은 불러오지 못했어요. 잠시 후 다시 시도해주세요.'),
    ).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: '다시 시도' }))
    expect(refetch).toHaveBeenCalled()
  })

  it('결과가 0건이면 EmptyState 를 노출', () => {
    mockStoreList({ data: onePage([]) })
    renderPage()
    expect(screen.getByText('주변 5km에 둘러볼 매장이 없어요.')).toBeInTheDocument()
  })

  it('매장이 있으면 카드를 렌더', () => {
    mockStoreList({ data: onePage([{ id: 1 }]) })
    renderPage()
    expect(screen.getByTestId('store-card')).toBeInTheDocument()
    expect(screen.queryByText('주변 5km에 둘러볼 매장이 없어요.')).not.toBeInTheDocument()
  })
})

describe('StoreListPage 알림 종', () => {
  it('종을 탭하면 알림센터로 연결된다', () => {
    mockStoreList({ data: onePage([]) })
    renderPage()
    expect(screen.getByRole('link', { name: '알림' })).toHaveAttribute('href', ROUTES.NOTIFICATIONS)
  })

  it('미읽음이 있으면 뱃지를 노출한다', () => {
    vi.mocked(useUnreadCount).mockReturnValue({
      data: 3,
    } as unknown as ReturnType<typeof useUnreadCount>)
    mockStoreList({ data: onePage([]) })
    renderPage()
    const bell = screen.getByRole('link', { name: '알림' })
    expect(within(bell).getByText('3')).toBeInTheDocument()
  })

  it('미읽음이 0이면 뱃지를 숨긴다', () => {
    mockStoreList({ data: onePage([]) })
    renderPage()
    const bell = screen.getByRole('link', { name: '알림' })
    expect(within(bell).queryByText(/\d/)).toBeNull()
  })
})
