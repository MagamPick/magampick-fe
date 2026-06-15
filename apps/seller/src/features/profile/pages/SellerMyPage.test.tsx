import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { ReactNode } from 'react'
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SellerMyPage } from './SellerMyPage'
import { apiClient } from '@/shared/lib/axios'

vi.mock('@/shared/lib/axios', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}))

// 로그아웃은 auth 도메인 — 여기선 "호출됐는지"만 검증 (인증 흐름은 auth 테스트가 커버)
const { logoutMutate } = vi.hoisted(() => ({ logoutMutate: vi.fn() }))
vi.mock('@/features/auth/hooks/useLogout', () => ({
  useLogout: () => ({ mutate: logoutMutate, isPending: false }),
}))

// 정산 요약 카드는 settlement 훅을 mock — 마이 허브 테스트는 메뉴/프로필 연결만 검증
vi.mock('@/features/settlement/hooks/useSettlementSummary', () => ({
  useSettlementSummary: () => ({
    data: {
      cycleId: 'c1',
      periodLabel: '6월 1차 · 6/1~6/15',
      netAmount: 2_805_000,
      depositDate: new Date(2026, 5, 10).toISOString(),
      status: 'SCHEDULED',
    },
    isPending: false,
  }),
}))

/** BE 응답 shape — phone은 하이픈 없는 원시값 */
const beProfile = {
  id: 1,
  email: 'minsoo@magampick.com',
  name: '김민수',
  phone: '01012345678',
}

function renderMyPage() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false } },
  })
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  )
  render(<SellerMyPage />, { wrapper })
}

describe('SellerMyPage (사장 마이 허브)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(apiClient.get).mockResolvedValue({ data: beProfile })
  })
  afterEach(() => {
    cleanup()
  })

  it('프로필 실명을 보여준다', async () => {
    renderMyPage()
    await waitFor(() => expect(screen.getByText(/김민수/)).toBeInTheDocument())
  })

  it('보유 매장·수정은 실제 라우트로 링크된다', async () => {
    renderMyPage()
    await waitFor(() => expect(screen.getByText(/김민수/)).toBeInTheDocument())
    expect(screen.getByRole('link', { name: '보유 매장' })).toHaveAttribute('href', '/store')
    expect(screen.getByRole('link', { name: '정산 내역' })).toHaveAttribute('href', '/settlement')
    expect(screen.getByRole('link', { name: '수정' })).toHaveAttribute('href', '/mypage/edit')
  })

  it('알림 설정은 실제 라우트로 링크된다', async () => {
    renderMyPage()
    await waitFor(() => expect(screen.getByText(/김민수/)).toBeInTheDocument())
    expect(screen.getByRole('link', { name: '알림 설정' })).toHaveAttribute(
      'href',
      '/mypage/notifications',
    )
  })

  it('비밀번호 변경은 실제 라우트로 링크된다', async () => {
    renderMyPage()
    await waitFor(() => expect(screen.getByText(/김민수/)).toBeInTheDocument())
    expect(screen.getByRole('link', { name: '비밀번호 변경' })).toHaveAttribute(
      'href',
      '/mypage/password',
    )
  })

  it('미구현 메뉴(약관 및 정책)를 누르면 준비 중 안내가 뜬다', async () => {
    const user = userEvent.setup()
    renderMyPage()
    await waitFor(() => expect(screen.getByText(/김민수/)).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: '약관 및 정책' }))
    expect(await screen.findByText('준비 중인 기능이에요')).toBeInTheDocument()
  })

  it('로그아웃을 누르고 확인하면 로그아웃을 호출한다', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    renderMyPage()
    await waitFor(() => expect(screen.getByText(/김민수/)).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: '로그아웃' }))
    expect(logoutMutate).toHaveBeenCalled()
  })
})
