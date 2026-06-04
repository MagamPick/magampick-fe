import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { KakaoCallbackPage } from './KakaoCallbackPage'
import { authApi } from '../api/authApi'
import { ApiError } from '@/shared/lib/apiError'

const mockNavigate = vi.fn()
vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>()
  return { ...actual, useNavigate: () => mockNavigate }
})
vi.mock('../api/authApi')

function renderCallback(entry: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[entry]}>
        <KakaoCallbackPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('KakaoCallbackPage', () => {
  beforeEach(() => vi.clearAllMocks())

  it('?code 가 있으면 인가코드+redirectUri 로 교환한다', async () => {
    vi.mocked(authApi.exchangeKakaoCode).mockResolvedValue({
      status: 'EXISTING',
      accessToken: 'a',
      accessExpiresIn: 1800,
    })
    renderCallback('/login/kakao/callback?code=abc123')

    await waitFor(() =>
      expect(authApi.exchangeKakaoCode).toHaveBeenCalledWith(
        expect.objectContaining({ authorizationCode: 'abc123' }),
      ),
    )
  })

  it('code 가 없으면 로그인으로 리다이렉트하고 교환하지 않는다', async () => {
    renderCallback('/login/kakao/callback')

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true }))
    expect(authApi.exchangeKakaoCode).not.toHaveBeenCalled()
  })

  it('카카오 동의 취소(?error=access_denied) 시 로그인으로 리다이렉트', async () => {
    renderCallback('/login/kakao/callback?error=access_denied')

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true }))
    expect(authApi.exchangeKakaoCode).not.toHaveBeenCalled()
  })

  it('이메일거부(KAKAO_EMAIL_REQUIRED) 시 재동의 모달 노출', async () => {
    vi.mocked(authApi.exchangeKakaoCode).mockRejectedValue(
      new ApiError(400, 'KAKAO_EMAIL_REQUIRED', '카카오 이메일 제공에 동의해야 가입할 수 있어요'),
    )
    renderCallback('/login/kakao/callback?code=abc')

    expect(await screen.findByText('이메일 동의가 필요합니다')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '다시 동의하기' })).toBeInTheDocument()
  })

  it('이메일충돌(EMAIL_ALREADY_REGISTERED) 시 일반 로그인 안내', async () => {
    vi.mocked(authApi.exchangeKakaoCode).mockRejectedValue(
      new ApiError(
        409,
        'EMAIL_ALREADY_REGISTERED',
        '이미 가입된 이메일입니다. 일반 로그인을 이용해주세요',
      ),
    )
    renderCallback('/login/kakao/callback?code=abc')

    expect(
      await screen.findByText('이미 가입된 이메일입니다. 일반 로그인을 이용해주세요'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '로그인으로 돌아가기' })).toBeInTheDocument()
  })

  it('기타 실패(SOCIAL_AUTH_FAILED) 시 실패 안내 + 돌아가기', async () => {
    vi.mocked(authApi.exchangeKakaoCode).mockRejectedValue(
      new ApiError(502, 'SOCIAL_AUTH_FAILED', '카카오 인증 실패'),
    )
    renderCallback('/login/kakao/callback?code=abc')

    expect(
      await screen.findByText('카카오 로그인에 실패했어요. 잠시 후 다시 시도해 주세요.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '로그인으로 돌아가기' })).toBeInTheDocument()
  })
})
