import type { ReactNode } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RefundManagePage } from './RefundManagePage'
import { resetRefundsForTest } from '../api/refundApi'

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
  beforeEach(() => resetRefundsForTest())

  it('대기중 환불 요청 목록을 보여준다', async () => {
    renderPage()
    expect(screen.getByText('환불 관리')).toBeInTheDocument()
    // s1 대기 시드(빵순이/김모닝/단골손님) 중 빵순이 노출
    expect(await screen.findByText('빵순이님')).toBeInTheDocument()
  })

  it('처리완료 탭으로 전환하면 처리된 환불 이력을 보여준다', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('빵순이님') // 대기중 로드 대기

    await user.click(screen.getByRole('tab', { name: /처리완료/ }))

    // 처리완료 시드(해피 승인 / 라떼 거부)
    expect(await screen.findByText('해피님')).toBeInTheDocument()
    // 대기중 카드(빵순이)는 더 이상 보이지 않음
    await waitFor(() => expect(screen.queryByText('빵순이님')).not.toBeInTheDocument())
  })
})
