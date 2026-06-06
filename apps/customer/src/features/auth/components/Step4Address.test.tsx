import { zodResolver } from '@hookform/resolvers/zod'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { Form } from '@/shared/components/ui/form'
import { Step4Address } from './Step4Address'
import { searchRoadAddress } from '../lib/addressSearch'
import { signupInputSchema, type SignupAddress, type SignupInput } from '../types'

vi.mock('../lib/addressSearch', () => ({
  searchRoadAddress: vi.fn(),
}))

const selectedAddress: SignupAddress = {
  label: '집',
  roadAddress: '서울특별시 마포구 와우산로 94',
  jibunAddress: '서울특별시 마포구 상수동 72-1',
  zonecode: '04066',
  sigunguCode: '11440',
  roadnameCode: '3135001',
}

function TestHost() {
  const form = useForm<SignupInput>({
    resolver: zodResolver(signupInputSchema),
    defaultValues: {
      agreedTermIds: [],
      email: '',
      password: '',
      passwordConfirm: '',
      name: '',
      phone: '',
      verificationToken: '',
      address: null,
      nickname: '',
    },
  })

  return (
    <Form {...form}>
      <Step4Address form={form} />
    </Form>
  )
}

describe('Step4Address', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('주소검색_선택_시_도로명주소와_위젯코드를_폼에_저장한다', async () => {
    vi.mocked(searchRoadAddress).mockResolvedValue(selectedAddress)
    const user = userEvent.setup()
    render(<TestHost />)

    await user.click(screen.getByRole('button', { name: '주소 검색' }))

    await waitFor(() =>
      expect(screen.getByRole('textbox', { name: /기본 주소/ })).toHaveValue(
        '서울특별시 마포구 와우산로 94',
      ),
    )
  })

  it('주소검색_실패_시_안내를_노출한다', async () => {
    vi.mocked(searchRoadAddress).mockRejectedValue(new Error('도로명 주소를 선택해주세요'))
    const user = userEvent.setup()
    render(<TestHost />)

    await user.click(screen.getByRole('button', { name: '주소 검색' }))

    expect(await screen.findByText('도로명 주소를 선택해주세요')).toBeInTheDocument()
  })
})
