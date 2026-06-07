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
  agreedTermIds: [1, 2, 3, 4],
  email: 'new@magampick.com',
  password: 'abcd1234!',
  passwordConfirm: 'abcd1234!',
  phone: '010-1234-5678',
  verificationToken: 'mock-verification-token',
  name: '홍길동',
  representativeName: '홍길동',
  businessNumber: '123-45-67890',
  openDate: '2020-01-01',
  bizVerified: true,
  storeName: '마감픽 베이커리 역삼점',
  storeAddress: {
    roadAddress: '서울 강남구 테헤란로 1',
    jibunAddress: '서울 강남구 역삼동 1',
    zonecode: '06234',
    sigunguCode: '11680',
    roadnameCode: '3179999',
  },
  storeAddressDetail: '1층',
  storePhone: '02-1234-5678',
  photoAdded: false,
}

describe('useSignup', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.getState().clear()
  })

  it('폼_값을_BE_payload로_매핑해_가입_API에_전송한다', async () => {
    vi.mocked(authApi.signup).mockResolvedValue({ accessToken: 'mock-access-token' })
    const { result } = renderHook(() => useSignup(), { wrapper: createQueryWrapper() })

    result.current.mutate(validInput)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(authApi.signup).toHaveBeenCalledWith({
      email: 'new@magampick.com',
      password: 'abcd1234!',
      ownerName: '홍길동',
      phone: '010-1234-5678',
      verificationToken: 'mock-verification-token',
      agreedTermIds: [1, 2, 3, 4],
      store: {
        businessNumber: '123-45-67890',
        representativeName: '홍길동',
        openDate: '2020-01-01',
        name: '마감픽 베이커리 역삼점',
        roadAddress: '서울 강남구 테헤란로 1',
        jibunAddress: '서울 강남구 역삼동 1',
        detailAddress: '1층',
        zonecode: '06234',
        phone: '02-1234-5678',
        sigunguCode: '11680',
        roadnameCode: '3179999',
      },
    })
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
