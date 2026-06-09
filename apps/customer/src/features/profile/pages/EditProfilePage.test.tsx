import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { EditProfilePage } from './EditProfilePage'

// profileApi mock — 실 BE 호출 없이 컴포넌트 렌더 검증
vi.mock('../api/profileApi', () => ({
  profileApi: {
    getProfile: vi.fn().mockResolvedValue({
      nickname: '마감픽사용자',
      email: 'user@magampick.com',
      phone: '010-1234-5678',
      avatarEmoji: '🐶',
    }),
    getStats: vi.fn(),
    updateNickname: vi.fn(),
  },
}))

const mockNavigate = vi.fn()
vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>()
  return { ...actual, useNavigate: () => mockNavigate }
})

function renderPage() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false } },
  })
  render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={['/mypage/edit']}>
        <EditProfilePage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('EditProfilePage (내 정보 수정)', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
  })
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('현재 닉네임·이메일을 보여주고, 이메일은 수정 불가(버튼 아님)', async () => {
    renderPage()
    await waitFor(() => expect(screen.getByText('마감픽사용자')).toBeInTheDocument())
    expect(screen.getByText('user@magampick.com')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /대표 이메일/ })).toBeNull()
  })

  it('닉네임 행을 누르면 닉네임 수정 시트가 열린다', async () => {
    const user = userEvent.setup()
    renderPage()
    await waitFor(() => expect(screen.getByText('마감픽사용자')).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: /닉네임/ }))
    expect(await screen.findByText('닉네임 수정')).toBeInTheDocument()
  })

  it('비밀번호 변경을 누르면 비밀번호 변경 화면으로 이동한다', async () => {
    const user = userEvent.setup()
    renderPage()
    await waitFor(() => expect(screen.getByText('마감픽사용자')).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: '비밀번호 변경' }))
    expect(mockNavigate).toHaveBeenCalledWith('/mypage/password')
  })
})
