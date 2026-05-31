import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { EditProfilePage } from './EditProfilePage'
import { __resetProfileStoreForTest } from '../api/profileApi'

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
  beforeEach(() => __resetProfileStoreForTest())
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

  it('비밀번호 변경은 준비 중 안내가 뜬다 (명세 비범위)', async () => {
    const user = userEvent.setup()
    renderPage()
    await waitFor(() => expect(screen.getByText('마감픽사용자')).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: '비밀번호 변경' }))
    expect(await screen.findByText('준비 중인 기능이에요')).toBeInTheDocument()
  })
})
