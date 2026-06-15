import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { LoginForm } from './LoginForm'
import { authApi } from '../api/authApi'
import { useAuthStore } from '../stores/authStore'

const mockNavigate = vi.fn()
vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>()
  return { ...actual, useNavigate: () => mockNavigate }
})
vi.mock('../api/authApi')

function renderForm() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  )
  return render(<LoginForm />, { wrapper: Wrapper })
}

async function fillCredentials(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('아이디'), 'admin')
  await user.type(screen.getByLabelText('비밀번호'), 'pw1234')
}

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.getState().clear()
  })

  it('유효입력_제출_시_username_password로_login_호출', async () => {
    const user = userEvent.setup()
    vi.mocked(authApi.login).mockResolvedValue({ accessToken: 'access-123' })
    renderForm()

    await fillCredentials(user)
    await user.click(screen.getByRole('button', { name: '로그인' }))

    await waitFor(() =>
      expect(authApi.login).toHaveBeenCalledWith({ username: 'admin', password: 'pw1234' }),
    )
  })

  it('로그인_실패_시_존재여부_비노출_단일_에러메시지_노출', async () => {
    const user = userEvent.setup()
    const { ApiError } = await import('@/shared/lib/apiError')
    vi.mocked(authApi.login).mockRejectedValue(
      new ApiError(401, 'LOGIN_FAILED', '서버 내부 메시지(노출되면 안 됨)'),
    )
    renderForm()

    await fillCredentials(user)
    await user.click(screen.getByRole('button', { name: '로그인' }))

    expect(await screen.findByText('아이디 또는 비밀번호를 확인해주세요')).toBeInTheDocument()
    expect(screen.queryByText('서버 내부 메시지(노출되면 안 됨)')).not.toBeInTheDocument()
  })

  it('빈값_제출_시_검증메시지_노출하고_login_미호출', async () => {
    const user = userEvent.setup()
    renderForm()

    await user.click(screen.getByRole('button', { name: '로그인' }))

    expect(await screen.findByText('아이디를 입력해주세요')).toBeInTheDocument()
    expect(authApi.login).not.toHaveBeenCalled()
  })

  it('회원가입_비밀번호찾기_카카오_링크가_없다_내부도구', () => {
    renderForm()
    expect(screen.queryByText('회원가입')).not.toBeInTheDocument()
    expect(screen.queryByText(/비밀번호 찾기/)).not.toBeInTheDocument()
    expect(screen.queryByText(/카카오/)).not.toBeInTheDocument()
  })
})
