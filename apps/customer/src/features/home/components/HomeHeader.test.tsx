import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { HomeHeader } from './HomeHeader'
import { useHomeAddress } from '../hooks/useHomeAddress'
import { useUnreadCount } from '@/features/notifications/hooks/useUnreadCount'
import { ROUTES } from '@/shared/lib/routes'

vi.mock('../hooks/useHomeAddress')
vi.mock('@/features/notifications/hooks/useUnreadCount')

beforeEach(() => {
  vi.mocked(useHomeAddress).mockReturnValue({
    data: { label: '서울 마포구 서교동' },
  } as unknown as ReturnType<typeof useHomeAddress>)
  vi.mocked(useUnreadCount).mockReturnValue({
    data: 3,
  } as unknown as ReturnType<typeof useUnreadCount>)
})

function renderHeader() {
  return render(
    <MemoryRouter>
      <HomeHeader />
    </MemoryRouter>,
  )
}

describe('HomeHeader', () => {
  it('기본_주소지_라벨_표시', () => {
    renderHeader()
    expect(screen.getByText('서울 마포구 서교동')).toBeInTheDocument()
  })

  it('주소칩_탭하면_주소지_화면으로_연결', () => {
    renderHeader()
    expect(screen.getByRole('link', { name: '서울 마포구 서교동' })).toHaveAttribute(
      'href',
      ROUTES.ADDRESSES,
    )
  })

  it('알림_탭하면_알림센터로_연결', () => {
    renderHeader()
    expect(screen.getByRole('link', { name: '알림' })).toHaveAttribute('href', ROUTES.NOTIFICATIONS)
  })

  it('미읽음_수_뱃지_표시', () => {
    renderHeader()
    const bell = screen.getByRole('link', { name: '알림' })
    expect(within(bell).getByText('3')).toBeInTheDocument()
  })

  it('미읽음_0이면_뱃지_숨김', () => {
    vi.mocked(useUnreadCount).mockReturnValue({
      data: 0,
    } as unknown as ReturnType<typeof useUnreadCount>)
    renderHeader()
    const bell = screen.getByRole('link', { name: '알림' })
    expect(within(bell).queryByText(/\d/)).toBeNull()
  })

  it('장바구니_탭하면_장바구니_화면으로_연결', () => {
    renderHeader()
    expect(screen.getByRole('link', { name: '장바구니' })).toHaveAttribute('href', ROUTES.CART)
  })
})
