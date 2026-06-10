import type { ReactNode } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RefundManagePage } from './RefundManagePage'
import { useRefundRequests } from '../hooks/useRefundRequests'
import { useRefundActions } from '../hooks/useRefundActions'
import type { RefundRequest } from '../types'

vi.mock('../hooks/useRefundRequests')
vi.mock('../hooks/useRefundActions')

type RequestsResult = ReturnType<typeof useRefundRequests>
type ActionsResult = ReturnType<typeof useRefundActions>

const refundFixture = (overrides: Partial<RefundRequest> = {}): RefundRequest => ({
  id: 'rf1',
  orderId: '42',
  orderNo: '1019',
  storeId: '1',
  customerName: '빵순이',
  items: [{ name: '크루아상', quantity: 1, price: 3000 }],
  amount: 3000,
  pickupCompletedAt: '2026-06-08T00:00:00.000Z',
  status: 'REQUESTED',
  reason: '사유',
  requestedAt: '2026-06-09T00:00:00.000Z',
  ...overrides,
})

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  )
  render(<RefundManagePage />, { wrapper })
}

describe('RefundManagePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useRefundActions).mockReturnValue({
      approve: { isPending: false, mutate: vi.fn() },
      reject: { isPending: false, mutate: vi.fn() },
    } as unknown as ActionsResult)
  })

  it('대기중 환불 요청 목록을 보여준다', async () => {
    vi.mocked(useRefundRequests).mockReturnValue({
      data: [refundFixture()],
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    } as unknown as RequestsResult)

    renderPage()

    expect(screen.getByText('환불 관리')).toBeInTheDocument()
    expect(await screen.findByText('빵순이님')).toBeInTheDocument()
  })

  it('처리완료 탭으로 전환하면 처리된 환불 이력을 보여준다', async () => {
    const user = userEvent.setup()
    vi.mocked(useRefundRequests).mockReturnValue({
      data: [
        refundFixture({
          id: 'rf1',
          customerName: '빵순이',
          status: 'REQUESTED',
          requestedAt: '2026-06-09T10:00:00.000Z',
        }),
        refundFixture({
          id: 'rf2',
          customerName: '해피',
          status: 'APPROVED',
          requestedAt: '2026-06-08T10:00:00.000Z',
          resolvedAt: '2026-06-09T00:00:00.000Z',
        }),
      ],
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    } as unknown as RequestsResult)

    renderPage()
    expect(await screen.findByText('빵순이님')).toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: /처리완료/ }))

    expect(await screen.findByText('해피님')).toBeInTheDocument()
    await waitFor(() => expect(screen.queryByText('빵순이님')).not.toBeInTheDocument())
  })
})
