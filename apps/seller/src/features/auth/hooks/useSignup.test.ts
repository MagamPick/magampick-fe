import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useSignup } from './useSignup'
import { authApi } from '../api/authApi'
import { useAuthStore } from '../stores/authStore'
import { createQueryWrapper } from '@/shared/test/queryWrapper'
import type { SignupInput } from '../types'

const mockNavigate = vi.fn()
vi.mock('react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-router')>()),
  useNavigate: () => mockNavigate,
}))
vi.mock('../api/authApi')

const validInput: SignupInput = {
  agreedTermIds: ['AGE_19', 'TERMS_OF_SERVICE', 'PRIVACY', 'LOCATION'],
  email: 'new@magampick.com',
  password: 'abcd1234!',
  passwordConfirm: 'abcd1234!',
  phone: '010-1234-5678',
  verificationToken: 'mock-verification-token',
  name: '홍길동',
  businessNumber: '123-45-67890',
  openDate: '2020-01-01',
  bizVerified: true,
  storeName: '마감픽 베이커리 역삼점',
  storeAddress: '서울 강남구 테헤란로 1',
  storeAddressDetail: '1층',
  storePhone: '02-1234-5678',
  photoAdded: false,
}

describe('useSignup', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.getState().clear()
  })

  it('가입_성공_시_토큰_저장하고_사장_메인으로_이동', async () => {
    vi.mocked(authApi.signup).mockResolvedValue({ accessToken: 'mock-access-token' })
    const { result } = renderHook(() => useSignup(), { wrapper: createQueryWrapper() })

    result.current.mutate(validInput)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(useAuthStore.getState().accessToken).toBe('mock-access-token')
    expect(useAuthStore.getState().isAuthenticated).toBe(true)
    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true })
  })
})
