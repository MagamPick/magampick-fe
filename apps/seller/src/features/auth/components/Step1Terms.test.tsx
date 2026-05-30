import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { describe, it, expect, vi } from 'vitest'
import { Step1Terms } from './Step1Terms'
import { signupInputSchema, type SignupInput, type TermId } from '../types'

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
  storeAddress: '',
  storeAddressDetail: '',
  storePhone: '',
  photoAdded: false,
}

function TestHost({ onOpenTerms = vi.fn() }: { onOpenTerms?: (id: TermId) => void }) {
  const form = useForm<SignupInput>({
    resolver: zodResolver(signupInputSchema),
    defaultValues: defaults,
  })
  return <Step1Terms form={form} onOpenTerms={onOpenTerms} />
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
