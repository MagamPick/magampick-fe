import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { NotificationList } from './NotificationList'
import type { Notification } from '../types'

vi.mock('../hooks/useMarkNotificationRead', () => ({
  useMarkNotificationRead: () => ({ mutate: vi.fn() }),
}))

// id=number, icon 필드 없음
const make = (id: number, title: string): Notification => ({
  id,
  category: 'system',
  title,
  body: '본문',
  createdAt: new Date().toISOString(),
  read: true,
  link: null,
})

const renderList = (props: Parameters<typeof NotificationList>[0]) =>
  render(
    <MemoryRouter>
      <NotificationList {...props} />
    </MemoryRouter>,
  )

describe('NotificationList', () => {
  it('로딩 중에는 안내 문구', () => {
    renderList({ notifications: undefined, isLoading: true })
    expect(screen.getByText('불러오는 중…')).toBeInTheDocument()
  })

  it('비어 있으면 빈 상태', () => {
    renderList({ notifications: [], isLoading: false })
    expect(screen.getByText('새 알림이 없어요')).toBeInTheDocument()
  })

  it('알림이 있으면 행을 렌더한다', () => {
    renderList({
      notifications: [make(1, '첫 알림'), make(2, '둘째 알림')],
      isLoading: false,
    })
    expect(screen.getByText('첫 알림')).toBeInTheDocument()
    expect(screen.getByText('둘째 알림')).toBeInTheDocument()
  })
})
