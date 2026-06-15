import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { NoticeAccordion } from './NoticeAccordion'
import type { Notice } from '../types'

const n = (over: Partial<Notice>): Notice => ({
  id: 'x',
  tag: 'notice',
  pinned: false,
  date: '2026-01-01',
  title: '제목',
  body: '본문',
  ...over,
})

describe('NoticeAccordion', () => {
  it('제목을 탭하면 본문이 펼쳐진다', async () => {
    render(<NoticeAccordion notices={[n({ id: 'a', title: '공지A', body: '본문A' })]} />)

    expect(screen.queryByText('본문A')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /공지A/ }))
    expect(screen.getByText('본문A')).toBeInTheDocument()
  })

  it('한 번에 하나만 열린다 — 다른 항목을 열면 이전 항목이 닫힌다', async () => {
    render(
      <NoticeAccordion
        notices={[
          n({ id: 'a', title: '공지A', body: '본문A' }),
          n({ id: 'b', title: '공지B', body: '본문B' }),
        ]}
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: /공지A/ }))
    expect(screen.getByText('본문A')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /공지B/ }))
    expect(screen.getByText('본문B')).toBeInTheDocument()
    expect(screen.queryByText('본문A')).not.toBeInTheDocument()
  })

  it('핀 고정 공지에 핀 아이콘을 표시한다', () => {
    render(<NoticeAccordion notices={[n({ id: 'a', title: '핀 공지', pinned: true })]} />)
    expect(document.querySelector('svg')).toBeInTheDocument()
  })
})
