import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest'
import { Step5Store } from './Step5Store'
import { authApi } from '../api/authApi'
import { searchStoreAddress } from '../lib/addressSearch'
import { ApiError } from '@/shared/lib/apiError'
import { createQueryWrapper } from '@/shared/test/queryWrapper'
import { Form } from '@/shared/components/ui/form'
import { signupInputSchema, type SignupInput, type StoreAddress } from '../types'

vi.mock('../api/authApi')
vi.mock('../lib/addressSearch', () => ({
  searchStoreAddress: vi.fn(),
}))

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

const selectedAddress: StoreAddress = {
  roadAddress: '서울특별시 강남구 테헤란로 427',
  jibunAddress: '서울특별시 강남구 삼성동 159-1',
  zonecode: '06158',
  sigunguCode: '11680',
  roadnameCode: '3179999',
}

function renderStep5(overrides: Partial<SignupInput> = {}) {
  function Host() {
    const form = useForm<SignupInput>({
      resolver: zodResolver(signupInputSchema),
      defaultValues: { ...defaults, ...overrides },
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
  beforeAll(() => {
    // jsdom 에 createObjectURL 미구현 — 미리보기용 stub
    URL.createObjectURL = vi.fn(() => 'blob:preview')
    URL.revokeObjectURL = vi.fn()
  })
  beforeEach(() => vi.clearAllMocks())

  it('대표사진_파일_선택_시_미리보기_노출', async () => {
    renderStep5()
    const input = screen.getByLabelText('매장 대표 사진')
    const file = new File(['img'], 'store.png', { type: 'image/png' })

    fireEvent.change(input, { target: { files: [file] } })

    expect(await screen.findByAltText('매장 대표 사진 미리보기')).toBeInTheDocument()
  })

  it('대표자명_Step4_사장님_성명으로_자동_채움', () => {
    renderStep5({ name: '박사장' })

    expect(screen.getByPlaceholderText('대표자 실명')).toHaveValue('박사장')
  })

  it('번호_대표자명_개업일자_갖춘_정상_사업자_조회_성공', async () => {
    vi.mocked(authApi.checkBusinessNumber).mockResolvedValue(undefined)
    const user = userEvent.setup()
    renderStep5({ name: '김사장', representativeName: '김사장', openDate: '2020-01-01' })

    await user.type(screen.getByPlaceholderText('000-00-00000'), '1234567890')
    await user.click(screen.getByRole('button', { name: '조회하기' }))

    expect(await screen.findByText('정상 등록된 사업자입니다.')).toBeInTheDocument()
  })

  it('조회되지_않는_사업자번호_시_실패_메시지', async () => {
    vi.mocked(authApi.checkBusinessNumber).mockRejectedValue(
      new ApiError(404, 'BUSINESS_NUMBER_INVALID', '조회되지 않는 사업자등록번호입니다'),
    )
    const user = userEvent.setup()
    renderStep5({ name: '김사장', representativeName: '김사장', openDate: '2020-01-01' })

    await user.type(screen.getByPlaceholderText('000-00-00000'), '0001234567')
    await user.click(screen.getByRole('button', { name: '조회하기' }))

    expect(await screen.findByText(/조회되지 않는 사업자등록번호입니다/)).toBeInTheDocument()
  })

  it('대표자명_비어있으면_조회_버튼_비활성', () => {
    renderStep5({ name: '', representativeName: '', openDate: '2020-01-01' })

    // 대표자명 미입력 → 조회 비활성 (사업자번호만으로는 진위확인 불가)
    expect(screen.getByRole('button', { name: '조회하기' })).toBeDisabled()
  })

  it('주소검색_선택_시_도로명주소를_폼에_저장한다', async () => {
    vi.mocked(searchStoreAddress).mockResolvedValue(selectedAddress)
    const user = userEvent.setup()
    renderStep5()

    await user.click(screen.getByRole('button', { name: '주소 검색' }))

    await waitFor(() =>
      expect(screen.getByRole('textbox', { name: /매장 주소/ })).toHaveValue(
        '서울특별시 강남구 테헤란로 427',
      ),
    )
  })

  it('주소검색_실패_시_안내를_노출한다', async () => {
    vi.mocked(searchStoreAddress).mockRejectedValue(new Error('도로명 주소를 선택해주세요'))
    const user = userEvent.setup()
    renderStep5()

    await user.click(screen.getByRole('button', { name: '주소 검색' }))

    expect(await screen.findByText('도로명 주소를 선택해주세요')).toBeInTheDocument()
  })
})
