import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect } from 'vitest'
import { SocialSignupPage } from './SocialSignupPage'
import type { KakaoProfile } from '../types'

function renderWizard(state?: { profile: KakaoProfile }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[{ pathname: '/signup/social', state }]}>
        <Routes>
          <Route path="/signup/social" element={<SocialSignupPage />} />
          <Route path="/login" element={<div>로그인 화면</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

const profile: KakaoProfile = { kakaoId: 'k1', email: 'k@kakao.com', nickname: '카카오사용자' }

describe('SocialSignupPage', () => {
  it('카카오_프로필_없이_진입_시_로그인_리다이렉트', () => {
    renderWizard(undefined)
    expect(screen.getByText('로그인 화면')).toBeInTheDocument()
  })

  it('약관_미동의_시_다음_비활성', () => {
    renderWizard({ profile })
    expect(screen.getByText('카카오로 회원가입')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '다음' })).toBeDisabled()
  })
})
