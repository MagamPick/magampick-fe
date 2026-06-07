import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { describe, it, expect, vi } from 'vitest'
import { Step1Terms } from './Step1Terms'
import { signupInputSchema, type SignupInput, type SignupTerm } from '../types'

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
  photoAdded: false,
}

const terms: SignupTerm[] = [
  { id: 1, type: 'AGE_19', version: 1, title: '만 19세 이상입니다', body: '만 19세 이상 확인', required: true },
  { id: 2, type: 'TERMS_OF_SERVICE', version: 1, title: '서비스 이용약관', body: '서비스 본문', required: true },
  { id: 3, type: 'PRIVACY', version: 1, title: '개인정보 수집·이용 동의', body: '개인정보 본문', required: true },
  { id: 4, type: 'LOCATION', version: 1, title: '위치기반 서비스 이용약관', body: '위치 본문', required: true },
  { id: 5, type: 'MARKETING', version: 1, title: '광고성 정보 수신', body: '마케팅 본문', required: false },
]

function TestHost({ onOpenTerms = vi.fn() }: { onOpenTerms?: (id: number) => void }) {
  const form = useForm<SignupInput>({
    resolver: zodResolver(signupInputSchema),
    defaultValues: defaults,
  })
  return <Step1Terms form={form} terms={terms} onOpenTerms={onOpenTerms} />
}

describe('Step1Terms', () => {
  it('전체동의_클릭_시_모든_약관_체크', async () => {
    const user = userEvent.setup()
    render(<TestHost />)

    await user.click(screen.getByRole('button', { name: /약관에 모두 동의/ }))

    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes.length).toBe(5)
    checkboxes.forEach((c) => expect(c).toBeChecked())
  })

  it('만19세_약관_항목_노출', () => {
    render(<TestHost />)
    expect(screen.getByText('만 19세 이상입니다')).toBeInTheDocument()
  })

  it('약관_보기_클릭_시_onOpenTerms_호출', async () => {
    const user = userEvent.setup()
    const onOpen = vi.fn()
    render(<TestHost onOpenTerms={onOpen} />)

    const viewButtons = screen.getAllByRole('button', { name: '보기' })
    await user.click(viewButtons[0])

    expect(onOpen).toHaveBeenCalledTimes(1)
  })
})
