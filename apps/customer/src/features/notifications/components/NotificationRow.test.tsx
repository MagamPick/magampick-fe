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

// id=number, icon 필드 없음 (BE 응답 shape)
const baseNotification: Notification = {
  id: 10,
  category: 'order',
  title: '주문이 픽업 대기 중이에요',
  body: '베이커리 브레드샵 · 크루아상 세트',
  createdAt: new Date().toISOString(),
  read: false,
  link: null,
}

function renderRow(notification: Notification) {
  return render(
    <MemoryRouter initialEntries={['/notifications']}>
      <Routes>
        <Route path="/notifications" element={<NotificationRow notification={notification} />} />
        <Route path="/orders" element={<div>주문 화면</div>} />
        <Route path="/" element={<div>홈 화면</div>} />
        <Route path="/reviews/my" element={<div>내 리뷰</div>} />
        <Route path="/mypage/coupons" element={<div>쿠폰 화면</div>} />
        <Route path="/notices" element={<div>공지 화면</div>} />
        <Route path="/support" element={<div>고객센터</div>} />
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

  it('category=order 이면 아이콘 영역을 렌더한다', () => {
    renderRow(baseNotification)
    // 아이콘은 SVG(lucide), aria-hidden. 버튼 안에 svg가 존재하는지 확인
    const button = screen.getByRole('button')
    expect(button.querySelector('svg')).not.toBeNull()
  })

  it('미읽음 행 클릭 시 읽음 처리(number id)하고 /orders 로 이동', async () => {
    const user = userEvent.setup()
    renderRow(baseNotification)
    await user.click(screen.getByRole('button'))
    // id 는 number 10
    expect(mockMutate).toHaveBeenCalledWith(10)
    expect(screen.getByText('주문 화면')).toBeInTheDocument()
  })

  it('이미 읽은 행은 미읽음 표시가 없고 읽음 처리를 호출하지 않는다', async () => {
    const user = userEvent.setup()
    renderRow({ ...baseNotification, read: true })
    expect(screen.queryByText('읽지 않음')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button'))
    expect(mockMutate).not.toHaveBeenCalled()
    // order → /orders
    expect(screen.getByText('주문 화면')).toBeInTheDocument()
  })

  it('category=deal 이면 홈으로 이동', async () => {
    const user = userEvent.setup()
    renderRow({ ...baseNotification, category: 'deal' })
    await user.click(screen.getByRole('button'))
    expect(screen.getByText('홈 화면')).toBeInTheDocument()
  })

  it('category=system 이면 클릭 시 이동 없음(화면 유지)', async () => {
    const user = userEvent.setup()
    renderRow({ ...baseNotification, category: 'system' })
    await user.click(screen.getByRole('button'))
    // system → route=null → 화면 이동 없음
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('category=review 이면 /reviews/my 로 이동', async () => {
    const user = userEvent.setup()
    renderRow({ ...baseNotification, category: 'review' })
    await user.click(screen.getByRole('button'))
    expect(screen.getByText('내 리뷰')).toBeInTheDocument()
  })
})
