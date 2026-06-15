import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useSignup } from './useSignup'
import { authApi } from '../api/authApi'
import { createQueryWrapper } from '@/shared/test/queryWrapper'
import type { SignupInput } from '../types'

const mockNavigate = vi.fn()
vi.mock('react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-router')>()),
  useNavigate: () => mockNavigate,
}))
vi.mock('../api/authApi')

const validInput: SignupInput = {
  agreedTermIds: [4, 1, 2, 3],
  email: 'new@magampick.com',
  password: 'abcd1234!',
  passwordConfirm: 'abcd1234!',
  name: '홍길동',
  phone: '010-1234-5678',
  verificationToken: 'mock-verification-token',
  address: {
    label: '집',
    roadAddress: '서울특별시 마포구 와우산로 94',
    jibunAddress: '서울특별시 마포구 상수동 72-1',
    zonecode: '04066',
    sigunguCode: '11440',
    roadnameCode: '3135001',
  },
  nickname: '마감픽유저',
}

describe('useSignup', () => {
  beforeEach(() => vi.clearAllMocks())

  it('가입_성공_시_welcome_으로_이동하며_토큰_전달', async () => {
    vi.mocked(authApi.signup).mockResolvedValue({ accessToken: 'mock-access-token' })
    const { result } = renderHook(() => useSignup(), { wrapper: createQueryWrapper() })

    result.current.mutate(validInput)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockNavigate).toHaveBeenCalledWith('/welcome', {
      state: { accessToken: 'mock-access-token', nickname: '마감픽유저' },
    })
  })
})
