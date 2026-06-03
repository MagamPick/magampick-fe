import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { KakaoCallbackPage } from './KakaoCallbackPage'
import { authApi } from '../api/authApi'
import { ApiError } from '@/shared/lib/apiError'
import type { KakaoScenario } from '../types'

vi.mock('../api/authApi')

function renderCallback(scenario: KakaoScenario) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[{ pathname: '/login/kakao/callback', state: { scenario } }]}>
        <KakaoCallbackPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('KakaoCallbackPage', () => {
  beforeEach(() => vi.clearAllMocks())

  it('이메일거부_시_재동의_모달_노출', async () => {
    vi.mocked(authApi.kakaoAuthorize).mockRejectedValue(
      new ApiError(400, 'KAKAO_EMAIL_REQUIRED', '카카오 이메일 제공에 동의해야 가입할 수 있어요'),
    )

    renderCallback('new_no_email')

    expect(await screen.findByText('이메일 동의가 필요합니다')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '다시 동의하기' })).toBeInTheDocument()
  })

  it('이메일충돌_시_일반로그인_안내', async () => {
    vi.mocked(authApi.kakaoAuthorize).mockRejectedValue(
      new ApiError(
        409,
        'EMAIL_ALREADY_REGISTERED',
        '이미 가입된 이메일입니다. 일반 로그인을 이용해주세요',
      ),
    )

    renderCallback('email_conflict')

    expect(
      await screen.findByText('이미 가입된 이메일입니다. 일반 로그인을 이용해주세요'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '로그인으로 돌아가기' })).toBeInTheDocument()
  })
})
