import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AnnouncementsTable } from './AnnouncementsTable'
import type { AnnouncementView } from '../types'

const pinned: AnnouncementView = {
  id: 1,
  tag: 'notice',
  pinned: true,
  date: '2026-06-20',
  title: '고정 공지',
  body: '본문',
}

const normal: AnnouncementView = {
  id: 2,
  tag: 'event',
  pinned: false,
  date: '2026-06-10',
  title: '일반 공지',
  body: '본문',
}

describe('AnnouncementsTable', () => {
  it('제목·태그·발행일을 렌더', () => {
    render(<AnnouncementsTable announcements={[pinned, normal]} onEdit={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('고정 공지')).toBeInTheDocument()
    expect(screen.getByText('일반 공지')).toBeInTheDocument()
    expect(screen.getByText('공지')).toBeInTheDocument()
    expect(screen.getByText('이벤트')).toBeInTheDocument()
    expect(screen.getByText('2026-06-20')).toBeInTheDocument()
  })

  it('핀 공지에만 고정 아이콘 노출', () => {
    render(<AnnouncementsTable announcements={[pinned, normal]} onEdit={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getAllByLabelText('상단 고정')).toHaveLength(1)
  })

  it('수정/삭제 클릭 시 해당 공지로 콜백', async () => {
    const onEdit = vi.fn()
    const onDelete = vi.fn()
    render(<AnnouncementsTable announcements={[pinned, normal]} onEdit={onEdit} onDelete={onDelete} />)
    const user = userEvent.setup()
    await user.click(screen.getAllByRole('button', { name: '수정' })[0])
    expect(onEdit).toHaveBeenCalledWith(pinned)
    await user.click(screen.getAllByRole('button', { name: '삭제' })[1])
    expect(onDelete).toHaveBeenCalledWith(normal)
  })
})
