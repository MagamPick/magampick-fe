import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AnnouncementTagBadge } from './AnnouncementTagBadge'

describe('AnnouncementTagBadge', () => {
  it('notice → 공지', () => {
    render(<AnnouncementTagBadge tag="notice" />)
    expect(screen.getByText('공지')).toBeInTheDocument()
  })
  it('event → 이벤트 (secondary 색)', () => {
    render(<AnnouncementTagBadge tag="event" />)
    const el = screen.getByText('이벤트')
    expect(el).toBeInTheDocument()
    expect(el.className).toContain('bg-secondary')
  })
  it('update → 업데이트 (info 색)', () => {
    render(<AnnouncementTagBadge tag="update" />)
    const el = screen.getByText('업데이트')
    expect(el).toBeInTheDocument()
    expect(el.className).toContain('text-info')
  })
})
