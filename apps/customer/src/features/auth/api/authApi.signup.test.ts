import { describe, expect, it, vi, beforeEach } from 'vitest'
import { apiClient } from '@/shared/lib/axios'
import { authApi } from './authApi'
import type { SignupAddress, SignupInput, SocialSignupInput } from '../types'

vi.mock('@/shared/lib/axios', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

const address: SignupAddress = {
  label: '집',
  roadAddress: '서울특별시 마포구 와우산로 94',
  jibunAddress: '서울특별시 마포구 상수동 72-1',
  zonecode: '04066',
  sigunguCode: '11440',
  roadnameCode: '3135001',
}

const input: SignupInput = {
  agreedTermIds: [4, 1, 2, 3, 5],
  email: 'new@magampick.com',
  password: 'abcd1234!',
  passwordConfirm: 'abcd1234!',
  name: '홍길동',
  phone: '010-1234-5678',
  verificationToken: 'verification-token',
  address,
  nickname: '마감픽유저',
}

const socialInput: SocialSignupInput = {
  socialToken: 'social-token',
  email: 'kakao@magampick.com',
  agreedTermIds: [4, 1, 2, 3],
  name: '홍길동',
  phone: '010-1234-5678',
  verificationToken: 'verification-token',
  address,
  nickname: '카카오유저',
}

describe('authApi.signup', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('소비자_회원가입_API에_약관id와_주소위젯값을_전송한다', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ data: { accessToken: 'access-token' } })

    await expect(authApi.signup(input)).resolves.toEqual({ accessToken: 'access-token' })

    expect(apiClient.post).toHaveBeenCalledWith('/auth/signup', {
      email: 'new@magampick.com',
      password: 'abcd1234!',
      nickname: '마감픽유저',
      phone: '010-1234-5678',
      verificationToken: 'verification-token',
      agreedTermIds: [4, 1, 2, 3, 5],
      address,
    })
  })

  it('소비자_약관_목록을_조회한다', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: [
        {
          id: 1,
          type: 'TERMS_OF_SERVICE',
          version: 1,
          title: '서비스 이용약관',
          body: '본문',
          required: true,
        },
      ],
    })

    await expect(authApi.listTerms()).resolves.toEqual([
      {
        id: 1,
        type: 'TERMS_OF_SERVICE',
        version: 1,
        title: '서비스 이용약관',
        body: '본문',
        required: true,
      },
    ])
    expect(apiClient.get).toHaveBeenCalledWith('/terms')
  })

  it('소비자_이메일_중복확인_API를_호출한다', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: { available: true } })

    await expect(authApi.checkEmail('new@magampick.com')).resolves.toEqual({ available: true })

    expect(apiClient.get).toHaveBeenCalledWith('/auth/email-availability', {
      params: { role: 'CUSTOMER', email: 'new@magampick.com' },
    })
  })

  it('카카오_신규회원_추가정보_가입_API에_필요한_값만_전송한다', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ data: { accessToken: 'social-access-token' } })

    await expect(authApi.socialSignup(socialInput)).resolves.toEqual({
      accessToken: 'social-access-token',
    })

    expect(apiClient.post).toHaveBeenCalledWith('/auth/signup/social', {
      socialToken: 'social-token',
      nickname: '카카오유저',
      phone: '010-1234-5678',
      verificationToken: 'verification-token',
      agreedTermIds: [4, 1, 2, 3],
      address,
    })
  })
})
