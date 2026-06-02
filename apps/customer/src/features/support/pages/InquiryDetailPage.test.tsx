import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { InquiryDetailPage } from './InquiryDetailPage'
import { supportApi } from '../api/supportApi'
import type { Inquiry } from '../types'
import { createQueryWrapper } from '@/shared/test/queryWrapper'

vi.mock('../api/supportApi')

const base: Inquiry = {
  id: 'iq1',
  category: 'order',
  title: '픽업 문의',
  content: '픽업 시간을 놓쳤어요',
  status: 'pending',
  createdAt: '2026-05-20',
  answer: null,
}

function renderDetail() {
  return render(
    <MemoryRouter initialEntries={['/support/inquiry/iq1']}>
      <Routes>
        <Route path="/support/inquiry/:id" element={<InquiryDetailPage />} />
      </Routes>
    </MemoryRouter>,
    { wrapper: createQueryWrapper() },
  )
}

describe('InquiryDetailPage', () => {
  beforeEach(() => vi.clearAllMocks())

  it('답변완료 문의는 관리자 답변을 보여준다', async () => {
    vi.mocked(supportApi.getInquiry).mockResolvedValue({
      ...base,
      status: 'answered',
      answer: { content: '매장에 방문해 코드를 보여주세요.', answeredAt: '2026-05-21' },
    })
    renderDetail()
    expect(await screen.findByText('매장에 방문해 코드를 보여주세요.')).toBeInTheDocument()
  })

  it('대기 문의는 답변 준비 중 안내를 보여준다', async () => {
    vi.mocked(supportApi.getInquiry).mockResolvedValue(base)
    renderDetail()
    expect(await screen.findByText(/답변을 준비하고 있어요/)).toBeInTheDocument()
  })
})
