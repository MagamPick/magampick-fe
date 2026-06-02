import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { HomeHero } from './HomeHero'
import { useUnreadCount } from '@/features/notifications/hooks/useUnreadCount'
import { ROUTES } from '@/shared/lib/routes'

// StoreSwitcher 는 매장 스토어/쿼리 의존 — 히어로 테스트는 종/마이 진입만 검증하므로 스텁
vi.mock('@/features/store/components/StoreSwitcher', () => ({
  StoreSwitcher: () => <div>매장 선택기</div>,
}))
vi.mock('@/features/notifications/hooks/useUnreadCount')

beforeEach(() => {
  vi.mocked(useUnreadCount).mockReturnValue({
    data: 3,
  } as unknown as ReturnType<typeof useUnreadCount>)
})

const renderHero = () =>
  render(
    <MemoryRouter>
      <HomeHero />
    </MemoryRouter>,
  )

describe('HomeHero', () => {
  it('알림_탭하면_알림센터로_연결', () => {
    renderHero()
    expect(screen.getByRole('link', { name: '알림' })).toHaveAttribute('href', ROUTES.NOTIFICATIONS)
  })

  it('미읽음_수_뱃지_표시', () => {
    renderHero()
    const bell = screen.getByRole('link', { name: '알림' })
    expect(within(bell).getByText('3')).toBeInTheDocument()
  })

  it('미읽음_0이면_뱃지_숨김', () => {
    vi.mocked(useUnreadCount).mockReturnValue({
      data: 0,
    } as unknown as ReturnType<typeof useUnreadCount>)
    renderHero()
    const bell = screen.getByRole('link', { name: '알림' })
    expect(within(bell).queryByText(/\d/)).toBeNull()
  })

  it('마이_탭하면_마이로_연결', () => {
    renderHero()
    expect(screen.getByRole('link', { name: '마이' })).toHaveAttribute('href', ROUTES.MYPAGE)
  })
})
