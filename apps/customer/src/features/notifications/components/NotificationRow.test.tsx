import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router'
import { NotificationRow } from './NotificationRow'
import type { Notification } from '../types'

const { mockMutate } = vi.hoisted(() => ({ mockMutate: vi.fn() }))
vi.mock('../hooks/useMarkNotificationRead', () => ({
  useMarkNotificationRead: () => ({ mutate: mockMutate }),
}))

const baseNotification: Notification = {
  id: 'n1',
  category: 'order',
  icon: '🛍️',
  title: '주문이 픽업 대기 중이에요',
  body: '베이커리 브레드샵 · 크루아상 세트',
  createdAt: new Date().toISOString(),
  read: false,
  link: '/orders',
}

function renderRow(notification: Notification) {
  return render(
    <MemoryRouter initialEntries={['/notifications']}>
      <Routes>
        <Route path="/notifications" element={<NotificationRow notification={notification} />} />
        <Route path="/orders" element={<div>주문 화면</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => mockMutate.mockClear())

describe('NotificationRow', () => {
  it('제목·본문을 보여주고 미읽음이면 표시한다', () => {
    renderRow(baseNotification)
    expect(screen.getByText('주문이 픽업 대기 중이에요')).toBeInTheDocument()
    expect(screen.getByText(/크루아상 세트/)).toBeInTheDocument()
    expect(screen.getByText('읽지 않음')).toBeInTheDocument()
  })

  it('미읽음 행 클릭 시 읽음 처리하고 링크 화면으로 이동한다', async () => {
    const user = userEvent.setup()
    renderRow(baseNotification)
    await user.click(screen.getByRole('button'))
    expect(mockMutate).toHaveBeenCalledWith('n1')
    expect(screen.getByText('주문 화면')).toBeInTheDocument()
  })

  it('이미 읽은 행은 미읽음 표시가 없고 읽음 처리를 호출하지 않는다', async () => {
    const user = userEvent.setup()
    renderRow({ ...baseNotification, read: true })
    expect(screen.queryByText('읽지 않음')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button'))
    expect(mockMutate).not.toHaveBeenCalled()
    expect(screen.getByText('주문 화면')).toBeInTheDocument()
  })
})
