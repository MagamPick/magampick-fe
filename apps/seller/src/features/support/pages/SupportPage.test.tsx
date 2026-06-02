import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SupportPage } from './SupportPage'
import { supportApi } from '../api/supportApi'
import type { Inquiry } from '../types'
import { createQueryWrapper } from '@/shared/test/queryWrapper'

vi.mock('../api/supportApi')

const inquiry: Inquiry = {
  id: 'iq1',
  category: 'settlement',
  title: '정산 문의',
  content: '정산 지급일이 궁금해요',
  status: 'pending',
  createdAt: '2026-05-29',
  answer: null,
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/support']}>
      <SupportPage />
    </MemoryRouter>,
    { wrapper: createQueryWrapper() },
  )
}

describe('SupportPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(supportApi.listFaqs).mockResolvedValue([
      { id: 'f1', question: '정산은 언제 이루어지나요?', answer: '매월 정해진 회차에 진행돼요.' },
    ])
    vi.mocked(supportApi.listInquiries).mockResolvedValue([inquiry])
  })

  it('기본은 FAQ 탭 — 자주 묻는 질문을 보여준다', async () => {
    renderPage()
    expect(await screen.findByText('정산은 언제 이루어지나요?')).toBeInTheDocument()
  })

  it('1:1 문의 탭으로 전환하면 [문의하기] 버튼과 내 문의 내역을 보여준다', async () => {
    renderPage()
    await userEvent.click(screen.getByRole('tab', { name: '1:1 문의' }))
    expect(await screen.findByText('정산 문의')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '문의하기' })).toBeInTheDocument()
  })
})
