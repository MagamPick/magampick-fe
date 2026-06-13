import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AnnouncementsPage } from './AnnouncementsPage'
import { createQueryWrapper } from '@/shared/test/queryWrapper'
import { announcementApi } from '../api/announcementApi'
import type { AnnouncementView } from '../types'

vi.mock('../api/announcementApi')

const sample: AnnouncementView = {
  id: 1,
  tag: 'notice',
  pinned: true,
  date: '2026-06-13',
  title: '서비스 점검 안내',
  body: '점검합니다',
}

function renderPage() {
  render(<AnnouncementsPage />, { wrapper: createQueryWrapper() })
}

beforeEach(() => vi.clearAllMocks())

describe('AnnouncementsPage', () => {
  it('빈 목록이면 EmptyState 노출', async () => {
    vi.mocked(announcementApi.listAnnouncements).mockResolvedValue([])
    renderPage()
    expect(await screen.findByText('등록된 공지가 없어요')).toBeInTheDocument()
  })

  it('목록이 있으면 테이블 렌더', async () => {
    vi.mocked(announcementApi.listAnnouncements).mockResolvedValue([sample])
    renderPage()
    expect(await screen.findByText('서비스 점검 안내')).toBeInTheDocument()
  })

  it('조회 실패 시 ErrorState(다시 시도) 노출', async () => {
    vi.mocked(announcementApi.listAnnouncements).mockRejectedValue(new Error('boom'))
    renderPage()
    expect(await screen.findByRole('button', { name: '다시 시도' })).toBeInTheDocument()
  })

  it('[새 공지] 클릭 시 생성 모달이 열린다', async () => {
    vi.mocked(announcementApi.listAnnouncements).mockResolvedValue([])
    renderPage()
    await screen.findByText('등록된 공지가 없어요')
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: '새 공지' }))
    // 생성 폼의 제출 버튼은 모달에만 존재
    expect(await screen.findByRole('button', { name: '발행' })).toBeInTheDocument()
  })
})
