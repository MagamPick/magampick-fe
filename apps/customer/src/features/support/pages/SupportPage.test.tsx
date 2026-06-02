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
  category: 'coupon',
  title: '쿠폰 문의',
  content: '쿠폰이 적용되지 않아요',
  status: 'pending',
  createdAt: '2026-05-28',
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
      { id: 'f1', question: '픽업은 어떻게 하나요?', answer: '코드를 보여주세요.' },
    ])
    vi.mocked(supportApi.listInquiries).mockResolvedValue([inquiry])
  })

  it('기본은 FAQ 탭 — 자주 묻는 질문을 보여준다', async () => {
    renderPage()
    expect(await screen.findByText('픽업은 어떻게 하나요?')).toBeInTheDocument()
  })

  it('1:1 문의 탭으로 전환하면 [문의하기] 버튼과 내 문의 내역을 보여준다', async () => {
    renderPage()
    await userEvent.click(screen.getByRole('tab', { name: '1:1 문의' }))
    expect(await screen.findByText('쿠폰 문의')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '문의하기' })).toBeInTheDocument()
  })
})
