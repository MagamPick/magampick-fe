import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { ReactNode } from 'react'
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MyPage } from './MyPage'
import { __resetProfileStoreForTest } from '../api/profileApi'

// 로그아웃은 auth 도메인 — MyPage 관점에선 "호출됐는지"만 검증 (인증 흐름은 auth 테스트가 커버)
const { logoutMutate } = vi.hoisted(() => ({ logoutMutate: vi.fn() }))
vi.mock('@/features/auth/hooks/useLogout', () => ({
  useLogout: () => ({ mutate: logoutMutate, isPending: false }),
}))

// 혜택 value 배지용 — 포인트/쿠폰 mock api (값은 검증 안 함, 지연 호출 제거로 결정성 확보)
vi.mock('@/features/points/api/pointApi', () => ({
  pointApi: { getSummary: vi.fn().mockResolvedValue({ balance: 2450 }) },
}))
vi.mock('@/features/coupons/api/couponApi', () => ({
  couponApi: { listCoupons: vi.fn().mockResolvedValue([]) },
}))

function renderMyPage() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false } },
  })
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  )
  render(<MyPage />, { wrapper })
}

describe('MyPage (마이페이지 허브)', () => {
  beforeEach(() => __resetProfileStoreForTest())
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('프로필 닉네임과 통계 라벨을 보여준다', async () => {
    renderMyPage()
    await waitFor(() => expect(screen.getByText(/마감픽사용자/)).toBeInTheDocument())
    expect(screen.getByText('이번 달 절약')).toBeInTheDocument()
    expect(screen.getByText('구한 음식')).toBeInTheDocument()
    expect(screen.getByText('단골 가게')).toBeInTheDocument()
  })

  it('주소 관리·찜한 가게·수정은 실제 라우트로 링크된다', async () => {
    renderMyPage()
    await waitFor(() => expect(screen.getByText(/마감픽사용자/)).toBeInTheDocument())
    expect(screen.getByRole('link', { name: '주소 관리' })).toHaveAttribute('href', '/addresses')
    expect(screen.getByRole('link', { name: '찜한 가게' })).toHaveAttribute('href', '/favs')
    expect(screen.getByRole('link', { name: '수정' })).toHaveAttribute('href', '/mypage/edit')
  })

  it('혜택 메뉴(이벤트·포인트·쿠폰함)는 실제 라우트로 링크된다', async () => {
    renderMyPage()
    await waitFor(() => expect(screen.getByText(/마감픽사용자/)).toBeInTheDocument())
    expect(screen.getByRole('link', { name: /이벤트/ })).toHaveAttribute('href', '/mypage/events')
    expect(screen.getByRole('link', { name: /포인트/ })).toHaveAttribute('href', '/mypage/points')
    expect(screen.getByRole('link', { name: /쿠폰함/ })).toHaveAttribute('href', '/mypage/coupons')
  })

  it('미구현 메뉴(알림 설정)를 누르면 준비 중 안내가 뜬다', async () => {
    const user = userEvent.setup()
    renderMyPage()
    await waitFor(() => expect(screen.getByText(/마감픽사용자/)).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: '알림 설정' }))
    expect(await screen.findByText('준비 중인 기능이에요')).toBeInTheDocument()
  })

  it('로그아웃을 누르고 확인하면 로그아웃을 호출한다', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    renderMyPage()
    await waitFor(() => expect(screen.getByText(/마감픽사용자/)).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: '로그아웃' }))
    expect(logoutMutate).toHaveBeenCalled()
  })
})
