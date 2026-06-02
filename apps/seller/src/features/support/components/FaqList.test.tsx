import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { FaqList } from './FaqList'
import type { Faq } from '../types'

const faqs: Faq[] = [
  { id: 'f1', question: '질문A', answer: '답변A' },
  { id: 'f2', question: '질문B', answer: '답변B' },
]

describe('FaqList', () => {
  it('질문을 탭하면 답변이 펼쳐진다', async () => {
    render(<FaqList faqs={faqs} />)
    expect(screen.queryByText('답변A')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: '질문A' }))
    expect(screen.getByText('답변A')).toBeInTheDocument()
  })

  it('한 번에 하나만 열린다', async () => {
    render(<FaqList faqs={faqs} />)
    await userEvent.click(screen.getByRole('button', { name: '질문A' }))
    await userEvent.click(screen.getByRole('button', { name: '질문B' }))
    expect(screen.getByText('답변B')).toBeInTheDocument()
    expect(screen.queryByText('답변A')).not.toBeInTheDocument()
  })
})
