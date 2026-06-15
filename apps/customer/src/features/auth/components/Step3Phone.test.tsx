import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Step3Phone } from './Step3Phone'
import { authApi } from '../api/authApi'
import { createQueryWrapper } from '@/shared/test/queryWrapper'
import { Form } from '@/shared/components/ui/form'
import { signupInputSchema, type SignupInput } from '../types'

vi.mock('../api/authApi')

const defaults: SignupInput = {
  agreedTermIds: [],
  email: '',
  password: '',
  passwordConfirm: '',
  name: '홍길동',
  phone: '010-1234-5678',
  verificationToken: '',
  address: null,
  nickname: '',
}

function renderStep3() {
  function Host() {
    const form = useForm<SignupInput>({
      resolver: zodResolver(signupInputSchema),
      defaultValues: defaults,
    })
    return (
      <Form {...form}>
        <Step3Phone form={form} />
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

describe('Step3Phone 인증번호 발송 실패', () => {
  beforeEach(() => vi.clearAllMocks())

  it('발송_실패_시_에러_메시지를_노출한다', async () => {
    vi.mocked(authApi.requestPhoneVerification).mockRejectedValue(
      new Error('인증번호 발송에 실패했어요'),
    )
    const user = userEvent.setup()
    renderStep3()

    await user.click(screen.getByRole('button', { name: '인증번호 받기' }))

    expect(await screen.findByText('인증번호 발송에 실패했어요')).toBeInTheDocument()
  })
})
