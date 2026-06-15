import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AnnouncementForm } from './AnnouncementForm'
import type { AnnouncementFormValues } from '../lib/announcementFormSchema'

const emptyDefaults: AnnouncementFormValues = { tag: 'notice', pinned: false, title: '', body: '' }

function renderForm(over: Partial<React.ComponentProps<typeof AnnouncementForm>> = {}) {
  const onSubmit = vi.fn()
  const onCancel = vi.fn()
  render(
    <AnnouncementForm
      defaultValues={emptyDefaults}
      isPending={false}
      submitLabel="발행"
      onSubmit={onSubmit}
      onCancel={onCancel}
      {...over}
    />,
  )
  return { onSubmit, onCancel }
}

describe('AnnouncementForm', () => {
  it('빈 제목 제출은 차단되고 검증 메시지가 노출', async () => {
    const { onSubmit } = renderForm()
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: '발행' }))
    expect(await screen.findByText('제목을 입력해 주세요')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('유효 입력 제출 시 trim 된 payload 로 콜백', async () => {
    const { onSubmit } = renderForm({
      defaultValues: { tag: 'notice', pinned: false, title: '  점검 안내  ', body: '  내용  ' },
    })
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: '발행' }))
    expect(onSubmit).toHaveBeenCalledWith({
      tag: 'notice',
      pinned: false,
      title: '점검 안내',
      body: '내용',
    })
  })

  it('상단 고정 스위치를 켜면 pinned=true 로 전송', async () => {
    const { onSubmit } = renderForm({
      defaultValues: { tag: 'event', pinned: false, title: '이벤트', body: '내용' },
    })
    const user = userEvent.setup()
    await user.click(screen.getByLabelText('상단 고정'))
    await user.click(screen.getByRole('button', { name: '발행' }))
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ pinned: true, tag: 'event' }),
    )
  })

  it('serverError 가 있으면 alert 로 노출', () => {
    renderForm({ serverError: '저장 실패' })
    expect(screen.getByRole('alert')).toHaveTextContent('저장 실패')
  })

  it('취소 클릭 시 onCancel 콜백', async () => {
    const { onCancel } = renderForm()
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: '취소' }))
    expect(onCancel).toHaveBeenCalled()
  })
})
