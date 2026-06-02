import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NoticeListPage } from './NoticeListPage'
import { noticeApi } from '../api/noticeApi'
import { createQueryWrapper } from '@/shared/test/queryWrapper'

vi.mock('../api/noticeApi')

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/notices']}>
      <NoticeListPage />
    </MemoryRouter>,
    { wrapper: createQueryWrapper() },
  )
}

describe('NoticeListPage', () => {
  beforeEach(() => vi.clearAllMocks())

  it('발행된 공지를 목록으로 표시한다', async () => {
    vi.mocked(noticeApi.listNotices).mockResolvedValue([
      { id: 'n1', tag: 'notice', pinned: true, date: '2025-05-15', title: '정산 일정 안내', body: '본문' },
    ])

    renderPage()

    expect(await screen.findByText('정산 일정 안내')).toBeInTheDocument()
  })

  it('공지가 없으면 빈 상태를 안내한다', async () => {
    vi.mocked(noticeApi.listNotices).mockResolvedValue([])

    renderPage()

    expect(await screen.findByText('공지사항이 없어요.')).toBeInTheDocument()
  })
})
