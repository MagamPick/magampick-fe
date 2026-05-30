import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Step5Store } from './Step5Store'
import { authApi } from '../api/authApi'
import { ApiError } from '@/shared/lib/apiError'
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
  businessNumber: '',
  openDate: '',
  bizVerified: false,
  storeName: '',
  storeAddress: '',
  storeAddressDetail: '',
  storePhone: '',
  photoAdded: false,
}

function renderStep5() {
  function Host() {
    const form = useForm<SignupInput>({
      resolver: zodResolver(signupInputSchema),
      defaultValues: defaults,
    })
    return (
      <Form {...form}>
        <Step5Store form={form} />
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

describe('Step5Store', () => {
  beforeEach(() => vi.clearAllMocks())

  it('대표사진_영역_클릭_시_등록완료로_토글', async () => {
    const user = userEvent.setup()
    renderStep5()

    await user.click(screen.getByText('대표 사진 등록'))

    expect(screen.getByText('대표 사진 등록 완료')).toBeInTheDocument()
  })

  it('정상_사업자번호_조회_시_성공_메시지', async () => {
    vi.mocked(authApi.checkBusinessNumber).mockResolvedValue({ verified: true })
    const user = userEvent.setup()
    renderStep5()

    await user.type(screen.getByPlaceholderText('000-00-00000'), '1234567890')
    await user.click(screen.getByRole('button', { name: '조회하기' }))

    expect(await screen.findByText('정상 등록된 사업자입니다.')).toBeInTheDocument()
  })

  it('조회되지_않는_사업자번호_시_실패_메시지', async () => {
    vi.mocked(authApi.checkBusinessNumber).mockRejectedValue(
      new ApiError(404, 'BUSINESS_NUMBER_INVALID', '조회되지 않는 사업자등록번호입니다'),
    )
    const user = userEvent.setup()
    renderStep5()

    await user.type(screen.getByPlaceholderText('000-00-00000'), '0001234567')
    await user.click(screen.getByRole('button', { name: '조회하기' }))

    expect(await screen.findByText(/조회되지 않는 사업자등록번호입니다/)).toBeInTheDocument()
  })
})
