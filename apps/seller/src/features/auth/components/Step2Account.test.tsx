import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Step2Account } from './Step2Account'
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
  phone: '',
  verificationToken: '',
  name: '',
  representativeName: '',
  businessNumber: '',
  openDate: '',
  bizVerified: false,
  storeName: '',
  storeAddress: null,
  storeAddressDetail: '',
  storePhone: '',
  storeImageFile: undefined,
}

function renderStep2() {
  function Host() {
    const form = useForm<SignupInput>({
      resolver: zodResolver(signupInputSchema),
      defaultValues: defaults,
    })
    return (
      <Form {...form}>
        <Step2Account form={form} />
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

describe('Step2Account 이메일 중복확인', () => {
  beforeEach(() => vi.clearAllMocks())

  it('중복확인_성공_시_사용가능_노출', async () => {
    vi.mocked(authApi.checkEmail).mockResolvedValue({ available: true })
    const user = userEvent.setup()
    renderStep2()

    await user.type(screen.getByPlaceholderText('example@magampick.com'), 'new@magampick.com')
    await user.click(screen.getByRole('button', { name: '중복확인' }))

    expect(await screen.findByText('사용 가능한 이메일이에요.')).toBeInTheDocument()
  })

  it('확인_후_이메일_수정하면_사용가능_메시지가_사라진다', async () => {
    vi.mocked(authApi.checkEmail).mockResolvedValue({ available: true })
    const user = userEvent.setup()
    renderStep2()

    const emailInput = screen.getByPlaceholderText('example@magampick.com')
    await user.type(emailInput, 'new@magampick.com')
    await user.click(screen.getByRole('button', { name: '중복확인' }))
    expect(await screen.findByText('사용 가능한 이메일이에요.')).toBeInTheDocument()

    // 이메일 수정 → 확인 상태 무효화
    await user.type(emailInput, 'x')

    await waitFor(() =>
      expect(screen.queryByText('사용 가능한 이메일이에요.')).not.toBeInTheDocument(),
    )
  })
})
