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
  await user.type(screen.getByLabelText('이메일'), 'owner@magampick.com')
  await user.type(screen.getByLabelText('비밀번호'), 'abcd1234!')
}

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.getState().clear()
  })

  it('유효입력_제출_시_login_호출', async () => {
    const user = userEvent.setup()
    vi.mocked(authApi.login).mockResolvedValue({ accessToken: 'access-123' })
    renderForm()

    await fillCredentials(user)
    await user.click(screen.getByRole('button', { name: '로그인' }))

    // 상태 유지 토글 기본 ON → keepSignedIn:true 와 함께 호출 (B1-5, 소비자와 동일)
    await waitFor(() =>
      expect(authApi.login).toHaveBeenCalledWith({
        email: 'owner@magampick.com',
        password: 'abcd1234!',
        keepSignedIn: true,
      }),
    )
  })

  it('로그인상태유지_토글_기본ON_클릭시_OFF', async () => {
    const user = userEvent.setup()
    renderForm()

    const toggle = screen.getByRole('checkbox', { name: '로그인 상태 유지' })
    expect(toggle).toBeChecked()

    await user.click(toggle)
    expect(toggle).not.toBeChecked()
  })

  it('토글_OFF_후_제출_시_keepSignedIn_false_전송', async () => {
    const user = userEvent.setup()
    vi.mocked(authApi.login).mockResolvedValue({ accessToken: 'access-123' })
    renderForm()

    await user.click(screen.getByRole('checkbox', { name: '로그인 상태 유지' }))
    await fillCredentials(user)
    await user.click(screen.getByRole('button', { name: '로그인' }))

    await waitFor(() =>
      expect(authApi.login).toHaveBeenCalledWith({
        email: 'owner@magampick.com',
        password: 'abcd1234!',
        keepSignedIn: false,
      }),
    )
  })

  it('로그인실패_시_에러메시지_노출', async () => {
    const user = userEvent.setup()
    const { ApiError } = await import('@/shared/lib/apiError')
    vi.mocked(authApi.login).mockRejectedValue(
      new ApiError(401, 'LOGIN_FAILED', '이메일 또는 비밀번호가 일치하지 않습니다'),
    )
    renderForm()

    await fillCredentials(user)
    await user.click(screen.getByRole('button', { name: '로그인' }))

    expect(await screen.findByText('이메일 또는 비밀번호가 일치하지 않습니다')).toBeInTheDocument()
  })

  it('비밀번호찾기_클릭_시_비밀번호_재설정으로_이동', async () => {
    const user = userEvent.setup()
    renderForm()

    await user.click(screen.getByRole('button', { name: '비밀번호 찾기' }))

    expect(mockNavigate).toHaveBeenCalledWith('/password-reset')
    expect(authApi.login).not.toHaveBeenCalled()
  })
})
