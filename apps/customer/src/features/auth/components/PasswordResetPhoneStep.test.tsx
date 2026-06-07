import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PasswordResetPhoneStep } from './PasswordResetPhoneStep'
import { authApi } from '../api/authApi'
import { createQueryWrapper } from '@/shared/test/queryWrapper'
import { Form } from '@/shared/components/ui/form'
import { passwordResetSchema, type PasswordResetInput } from '../types'

vi.mock('../api/authApi')

const defaults: PasswordResetInput = {
  email: '',
  phone: '010-1234-5678',
  verificationToken: '',
  newPassword: '',
  newPasswordConfirm: '',
}

function renderStep() {
  function Host() {
    const form = useForm<PasswordResetInput>({
      resolver: zodResolver(passwordResetSchema),
      defaultValues: defaults,
    })
    return (
      <Form {...form}>
        <PasswordResetPhoneStep form={form} />
      </Form>
    )
  }
  const Wrapper = createQueryWrapper()
  return render(
    <Wrapper>
      <Host />
    </Wrapper>,
  )
}

describe('PasswordResetPhoneStep 인증번호 발송 실패', () => {
  beforeEach(() => vi.clearAllMocks())

  it('발송_실패_시_에러_메시지를_노출한다', async () => {
    vi.mocked(authApi.requestPhoneVerification).mockRejectedValue(
      new Error('인증번호 발송에 실패했어요'),
    )
    const user = userEvent.setup()
    renderStep()

    await user.click(screen.getByRole('button', { name: '인증번호 받기' }))

    expect(await screen.findByText('인증번호 발송에 실패했어요')).toBeInTheDocument()
  })
})
