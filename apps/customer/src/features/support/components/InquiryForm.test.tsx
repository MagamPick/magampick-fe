import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { InquiryForm } from './InquiryForm'
import { supportApi } from '../api/supportApi'
import { createQueryWrapper } from '@/shared/test/queryWrapper'

vi.mock('../api/supportApi')

function renderForm() {
  return render(<InquiryForm />, { wrapper: createQueryWrapper() })
}

describe('InquiryForm', () => {
  beforeEach(() => vi.clearAllMocks())

  it('제목·내용이 기준 미만이면 제출 버튼이 비활성', async () => {
    renderForm()
    const submitBtn = screen.getByRole('button', { name: /문의 보내기/ })
    expect(submitBtn).toBeDisabled()

    await userEvent.type(screen.getByLabelText('제목'), '제') // 1자 — 부족
    await userEvent.type(screen.getByLabelText('내용'), '짧음') // 10자 미만
    expect(submitBtn).toBeDisabled()
  })

  it('유효한 값을 채우면 제출 버튼이 활성화되고 제출 시 API가 호출된다', async () => {
    vi.mocked(supportApi.submitInquiry).mockResolvedValue({
      id: 'iq1',
      category: 'payment',
      title: '제목입니다',
      content: '내용을 충분히 길게 적었어요',
      status: 'pending',
      createdAt: '2026-06-02',
      answer: null,
    })
    renderForm()

    await userEvent.type(screen.getByLabelText('제목'), '제목입니다')
    await userEvent.type(screen.getByLabelText('내용'), '내용을 충분히 길게 적었어요')

    const submitBtn = screen.getByRole('button', { name: /문의 보내기/ })
    expect(submitBtn).toBeEnabled()

    await userEvent.click(submitBtn)
    expect(supportApi.submitInquiry).toHaveBeenCalledOnce()
  })
})
