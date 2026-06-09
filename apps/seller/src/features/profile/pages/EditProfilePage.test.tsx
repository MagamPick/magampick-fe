import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { EditProfilePage } from './EditProfilePage'
import { apiClient } from '@/shared/lib/axios'

vi.mock('@/shared/lib/axios', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}))

const mockNavigate = vi.fn()
vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>()
  return { ...actual, useNavigate: () => mockNavigate }
})

/** BE 응답 shape — phone은 하이픈 없는 원시값 */
const beProfile = {
  id: 1,
  email: 'minsoo@magampick.com',
  name: '김민수',
  phone: '01012345678',
}

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
    vi.clearAllMocks()
    vi.mocked(apiClient.get).mockResolvedValue({ data: beProfile })
    mockNavigate.mockClear()
  })
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('현재 실명·이메일을 보여주고, 이메일은 수정 불가(버튼 아님)', async () => {
    renderPage()
    await waitFor(() => expect(screen.getByText('김민수')).toBeInTheDocument())
    expect(screen.getByText('minsoo@magampick.com')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /대표 이메일/ })).toBeNull()
  })

  it('휴대폰 번호를 하이픈 포맷으로 표시한다', async () => {
    renderPage()
    await waitFor(() => expect(screen.getByText('010-1234-5678')).toBeInTheDocument())
  })

  it('실명 행을 누르면 실명 수정 시트가 열린다', async () => {
    const user = userEvent.setup()
    renderPage()
    await waitFor(() => expect(screen.getByText('김민수')).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: /실명/ }))
    expect(await screen.findByText('실명 수정')).toBeInTheDocument()
  })

  it('비밀번호 변경을 누르면 비밀번호 변경 화면으로 이동한다', async () => {
    const user = userEvent.setup()
    renderPage()
    await waitFor(() => expect(screen.getByText('김민수')).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: '비밀번호 변경' }))
    expect(mockNavigate).toHaveBeenCalledWith('/mypage/password')
  })
})
