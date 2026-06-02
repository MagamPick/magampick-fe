import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PasswordResetPage } from './PasswordResetPage'
import { authApi } from '../api/authApi'
import { ApiError } from '@/shared/lib/apiError'
import { PASSWORD_RESET_ERROR } from '../types'

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
  return render(<PasswordResetPage />, { wrapper: Wrapper })
}

/** Step1 이메일 → Step2 휴대폰 본인인증(완료 배지)까지 진행. 마지막 [다음](매칭)은 각 테스트가 클릭. */
async function verifyPhone(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByPlaceholderText('example@magampick.com'), 'demo@magampick.com')
  await user.click(screen.getByRole('button', { name: '다음' }))

  await user.type(screen.getByPlaceholderText('010-0000-0000'), '01012345678')
  await user.click(screen.getByRole('button', { name: '인증번호 받기' }))
  await user.type(await screen.findByPlaceholderText('6자리 숫자'), '000000')
  await user.click(screen.getByRole('button', { name: '인증 확인' }))
  await screen.findByText('휴대폰 인증이 완료되었습니다')
}

describe('PasswordResetPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(authApi.requestPhoneVerification).mockResolvedValue(undefined)
    vi.mocked(authApi.verifyPhoneCode).mockResolvedValue({
      verificationToken: 'mock-verification-token',
    })
  })

  it('이메일_형식_전에는_다음_비활성', async () => {
    const user = userEvent.setup()
    renderPage()
    expect(screen.getByRole('button', { name: '다음' })).toBeDisabled()

    await user.type(screen.getByPlaceholderText('example@magampick.com'), 'demo@magampick.com')
    expect(screen.getByRole('button', { name: '다음' })).toBeEnabled()
  })

  it('이메일→본인인증→새비번→완료_전체_흐름_성공', async () => {
    const user = userEvent.setup()
    vi.mocked(authApi.verifyPasswordResetIdentity).mockResolvedValue({ resetToken: 'reset-token' })
    vi.mocked(authApi.resetPassword).mockResolvedValue(undefined)
    renderPage()

    await verifyPhone(user)
    await user.click(screen.getByRole('button', { name: '다음' }))

    await user.type(await screen.findByPlaceholderText('새 비밀번호 입력'), 'abcd1234!')
    await user.type(screen.getByPlaceholderText('새 비밀번호 다시 입력'), 'abcd1234!')
    await user.click(screen.getByRole('button', { name: '완료' }))

    expect(await screen.findByRole('button', { name: '로그인하러 가기' })).toBeInTheDocument()
    expect(authApi.resetPassword).toHaveBeenCalledWith({
      resetToken: 'reset-token',
      newPassword: 'abcd1234!',
    })

    await user.click(screen.getByRole('button', { name: '로그인하러 가기' }))
    expect(mockNavigate).toHaveBeenCalledWith('/login')
  })

  it('이메일↔휴대폰_불일치_시_동일_거부_메시지', async () => {
    const user = userEvent.setup()
    vi.mocked(authApi.verifyPasswordResetIdentity).mockRejectedValue(
      new ApiError(
        404,
        PASSWORD_RESET_ERROR.RESET_VERIFICATION_FAILED,
        '입력하신 정보와 일치하는 계정을 찾을 수 없어요',
      ),
    )
    renderPage()

    await verifyPhone(user)
    await user.click(screen.getByRole('button', { name: '다음' }))

    expect(
      await screen.findByText('입력하신 정보와 일치하는 계정을 찾을 수 없어요'),
    ).toBeInTheDocument()
  })
})
