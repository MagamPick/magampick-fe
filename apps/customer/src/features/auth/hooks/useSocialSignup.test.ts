import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useSocialSignup } from './useSocialSignup'
import { authApi } from '../api/authApi'
import { createQueryWrapper } from '@/shared/test/queryWrapper'
import type { SocialSignupInput } from '../types'

const mockNavigate = vi.fn()
vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>()
  return { ...actual, useNavigate: () => mockNavigate }
})
vi.mock('../api/authApi')

const input: SocialSignupInput = {
  socialToken: 'st-uuid',
  email: 'k@kakao.com',
  agreedTermIds: [4, 1, 2, 3],
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
  nickname: '길동이',
}

describe('useSocialSignup', () => {
  beforeEach(() => vi.clearAllMocks())

  it('가입성공_시_welcome이동_토큰닉네임전달', async () => {
    vi.mocked(authApi.socialSignup).mockResolvedValue({ accessToken: 'access-s' })
    const { result } = renderHook(() => useSocialSignup(), { wrapper: createQueryWrapper() })

    result.current.mutate(input)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockNavigate).toHaveBeenCalledWith('/welcome', {
      state: { accessToken: 'access-s', nickname: '길동이' },
    })
  })
})
