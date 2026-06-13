import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter, Routes, Route } from 'react-router'
import { AdminShell } from './AdminShell'

const mockLogout = vi.fn()
vi.mock('@/features/auth/hooks/useLogout', () => ({
  useLogout: () => ({ mutate: mockLogout, isPending: false }),
}))

function renderShell(initial = '/events') {
  return render(
    <MemoryRouter initialEntries={[initial]}>
      <Routes>
        <Route element={<AdminShell />}>
          <Route path="/events" element={<div>events content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

describe('AdminShell', () => {
  beforeEach(() => vi.clearAllMocks())

  it('사이드바_네비_4개와_아웃렛_콘텐츠를_렌더한다', () => {
    renderShell()
    expect(screen.getByRole('link', { name: '이벤트' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '공지사항' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '문의' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '운영 도구' })).toBeInTheDocument()
    expect(screen.getByText('events content')).toBeInTheDocument()
  })

  it('활성_네비를_aria-current로_표시한다', () => {
    renderShell('/events')
    expect(screen.getByRole('link', { name: '이벤트' })).toHaveAttribute('aria-current', 'page')
  })

  it('로그아웃_클릭_시_useLogout_mutate를_호출한다', async () => {
    const user = userEvent.setup()
    renderShell()
    await user.click(screen.getByRole('button', { name: '로그아웃' }))
    expect(mockLogout).toHaveBeenCalled()
  })
})
