import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EventForm } from './EventForm'
import type { EventFormValues } from '../lib/eventFormSchema'

const TODAY = '2026-06-13'

const emptyDefaults: EventFormValues = {
  label: '',
  discountType: 'RATE',
  value: '',
  minOrder: '0',
  unlimited: false,
  issueLimit: '',
  validUntil: '',
  displayStartAt: '',
  displayEndAt: '',
}

function renderForm(over: Partial<React.ComponentProps<typeof EventForm>> = {}) {
  const onSubmit = vi.fn()
  const onCancel = vi.fn()
  render(
    <EventForm
      mode="create"
      today={TODAY}
      defaultValues={emptyDefaults}
      isPending={false}
      submitLabel="이벤트 생성"
      onSubmit={onSubmit}
      onCancel={onCancel}
      {...over}
    />,
  )
  return { onSubmit, onCancel }
}

describe('EventForm', () => {
  it('discountType 전환 시 값 라벨/플레이스홀더가 바뀐다', async () => {
    renderForm()
    const user = userEvent.setup()
    // 초기 RATE
    expect(screen.getByText('할인율')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('1 ~ 100')).toBeInTheDocument()
    // 정액으로 전환
    await user.click(screen.getByRole('button', { name: '정액 (원)' }))
    expect(screen.getByText('할인 금액')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('예) 2000')).toBeInTheDocument()
  })

  it('무제한 발급 체크 시 발급 수량 입력이 비활성', async () => {
    renderForm()
    const user = userEvent.setup()
    const issueInput = screen.getByPlaceholderText('예) 100')
    expect(issueInput).toBeEnabled()
    await user.click(screen.getByRole('checkbox'))
    expect(issueInput).toBeDisabled()
  })

  it('수정 모드 + 발급분 존재 시 소급 안내 노출', () => {
    renderForm({
      mode: 'edit',
      issuedCount: 5,
      submitLabel: '수정 저장',
      defaultValues: {
        ...emptyDefaults,
        label: '여름 쿠폰',
        value: '10',
        issueLimit: '100',
        validUntil: '2026-07-31',
        displayStartAt: '2026-06-20',
        displayEndAt: '2026-07-20',
      },
    })
    expect(
      screen.getByText('이미 발급된 쿠폰에는 적용되지 않고, 이후 발급분부터 반영됩니다.'),
    ).toBeInTheDocument()
  })

  it('빈 폼 제출은 차단되고 검증 메시지가 노출', async () => {
    const { onSubmit } = renderForm()
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: '이벤트 생성' }))
    expect(await screen.findByText('라벨을 입력해 주세요')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
