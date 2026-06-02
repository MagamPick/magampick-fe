import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PasswordChangePage } from './PasswordChangePage'
import { authApi } from '../api/authApi'
import { ApiError } from '@/shared/lib/apiError'
import { PASSWORD_CHANGE_ERROR } from '../types'

const mockNavigate = vi.fn()
vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>()
  return { ...actual, useNavigate: () => mockNavigate }
})
vi.mock('../api/authApi')

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  )
  return render(<PasswordChangePage />, { wrapper: Wrapper })
}

async function fillForm(
  user: ReturnType<typeof userEvent.setup>,
  { current, next, confirm }: { current: string; next: string; confirm: string },
) {
  await user.type(screen.getByPlaceholderText('현재 비밀번호 입력'), current)
  await user.type(screen.getByPlaceholderText('새 비밀번호 입력'), next)
  await user.type(screen.getByPlaceholderText('새 비밀번호 다시 입력'), confirm)
}

describe('PasswordChangePage', () => {
  beforeEach(() => vi.clearAllMocks())

  it('필드_충족_전에는_변경하기_비활성', async () => {
    const user = userEvent.setup()
    renderPage()
    expect(screen.getByRole('button', { name: '변경하기' })).toBeDisabled()

    await fillForm(user, { current: 'Magampick1!', next: 'abcd1234!', confirm: 'abcd1234!' })
    expect(screen.getByRole('button', { name: '변경하기' })).toBeEnabled()
  })

  it('새_비밀번호_확인_불일치면_변경하기_비활성', async () => {
    const user = userEvent.setup()
    renderPage()
    await fillForm(user, { current: 'Magampick1!', next: 'abcd1234!', confirm: 'different1!' })
    expect(screen.getByRole('button', { name: '변경하기' })).toBeDisabled()
  })

  it('변경_성공_시_완료_화면_후_확인하면_뒤로_이동', async () => {
    const user = userEvent.setup()
    vi.mocked(authApi.changePassword).mockResolvedValue(undefined)
    renderPage()

    await fillForm(user, { current: 'Magampick1!', next: 'abcd1234!', confirm: 'abcd1234!' })
    await user.click(screen.getByRole('button', { name: '변경하기' }))

    // 완료 화면 도달 = 완료 화면 전용 CTA 노출
    expect(await screen.findByRole('button', { name: '확인' })).toBeInTheDocument()
    expect(authApi.changePassword).toHaveBeenCalledWith({
      currentPassword: 'Magampick1!',
      newPassword: 'abcd1234!',
    })

    await user.click(screen.getByRole('button', { name: '확인' }))
    expect(mockNavigate).toHaveBeenCalledWith(-1)
  })

  it('현재_비밀번호_불일치면_에러_메시지_노출하고_완료화면_안감', async () => {
    const user = userEvent.setup()
    vi.mocked(authApi.changePassword).mockRejectedValue(
      new ApiError(
        400,
        PASSWORD_CHANGE_ERROR.CURRENT_PASSWORD_MISMATCH,
        '현재 비밀번호가 일치하지 않습니다',
      ),
    )
    renderPage()

    await fillForm(user, { current: 'wrongpass1!', next: 'abcd1234!', confirm: 'abcd1234!' })
    await user.click(screen.getByRole('button', { name: '변경하기' }))

    expect(await screen.findByText('현재 비밀번호가 일치하지 않습니다')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '확인' })).not.toBeInTheDocument()
  })
})
