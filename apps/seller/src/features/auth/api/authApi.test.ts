import { describe, it, expect, vi, beforeEach } from 'vitest'
import { apiClient } from '@/shared/lib/axios'
import { authApi } from './authApi'
import type { SellerSignupPayload, SignupTerm } from '../types'

vi.mock('@/shared/lib/axios', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}))

beforeEach(() => {
  vi.clearAllMocks()
})

const term: SignupTerm = {
  id: 1,
  type: 'AGE_19',
  version: 1,
  title: '만 19세 이상입니다',
  body: '본문',
  required: true,
}

const payload: SellerSignupPayload = {
  email: 'seller@magampick.com',
  password: 'abcd1234!',
  ownerName: '홍길동',
  phone: '010-1234-5678',
  verificationToken: 'verification-token',
  agreedTermIds: [1, 2, 3, 6],
  store: {
    businessNumber: '123-45-67890',
    representativeName: '홍길동',
    openDate: '2024-03-15',
    name: '동네빵집',
    roadAddress: '서울특별시 강남구 테헤란로 427',
    jibunAddress: '서울특별시 강남구 삼성동 159-1',
    detailAddress: '1층',
    zonecode: '06158',
    phone: '0212345678',
    sigunguCode: '11680',
    roadnameCode: '3179999',
  },
}

describe('authApi 약관·이메일', () => {
  it('사장_약관_목록을_role=SELLER로_조회한다', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: [term] })

    await expect(authApi.listTerms()).resolves.toEqual([term])
    expect(apiClient.get).toHaveBeenCalledWith('/terms', { params: { role: 'SELLER' } })
  })

  it('사장_이메일_중복확인을_role=SELLER로_호출한다', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: { available: true } })

    await expect(authApi.checkEmail('new@magampick.com')).resolves.toEqual({ available: true })
    expect(apiClient.get).toHaveBeenCalledWith('/auth/email-availability', {
      params: { role: 'SELLER', email: 'new@magampick.com' },
    })
  })
})

describe('authApi 휴대폰 본인인증', () => {
  it('인증번호_발송을_요청한다', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ data: undefined })

    await authApi.requestPhoneVerification('010-1234-5678')
    expect(apiClient.post).toHaveBeenCalledWith('/auth/phone-verifications', {
      phone: '010-1234-5678',
    })
  })

  it('인증번호를_검증해_verificationToken을_받는다', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ data: { verificationToken: 'vtoken' } })

    await expect(
      authApi.verifyPhoneCode({ phone: '010-1234-5678', code: '123456' }),
    ).resolves.toEqual({ verificationToken: 'vtoken' })
    expect(apiClient.post).toHaveBeenCalledWith('/auth/phone-verifications/confirm', {
      phone: '010-1234-5678',
      code: '123456',
    })
  })
})

describe('authApi 사업자 진위확인', () => {
  it('가입용_사업자_진위확인_API를_호출한다', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ data: undefined })

    await authApi.checkBusinessNumber({
      businessNumber: '123-45-67890',
      representativeName: '홍길동',
      openDate: '2024-03-15',
    })
    expect(apiClient.post).toHaveBeenCalledWith('/auth/seller/stores/business-verification', {
      businessNumber: '123-45-67890',
      representativeName: '홍길동',
      openDate: '2024-03-15',
    })
  })
})

describe('authApi 회원가입 (multipart)', () => {
  it('request_JSON_파트를_담아_multipart로_전송한다', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ data: { accessToken: 'access-token' } })

    await expect(authApi.signup(payload)).resolves.toEqual({ accessToken: 'access-token' })

    expect(apiClient.post).toHaveBeenCalledWith('/auth/seller/signup', expect.any(FormData), {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    const form = vi.mocked(apiClient.post).mock.calls[0][1] as FormData
    const requestPart = form.get('request') as Blob
    expect(JSON.parse(await requestPart.text())).toEqual(payload)
    expect(form.get('image')).toBeNull()
  })

  it('대표사진_파일이_있으면_image_파트로_함께_보낸다', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ data: { accessToken: 'access-token' } })
    const file = new File(['fake'], 'store.png', { type: 'image/png' })

    await authApi.signup(payload, file)
    const form = vi.mocked(apiClient.post).mock.calls[0][1] as FormData
    expect(form.get('image')).toBeInstanceOf(File)
  })
})

describe('authApi 로그인·로그아웃', () => {
  it('사장_로그인은_seller_엔드포인트로_입력_keepSignedIn_값을_그대로_전송한다', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ data: { accessToken: 'access-token' } })

    // 토글 OFF → false 그대로 전송
    await expect(
      authApi.login({ email: 'demo@magampick.com', password: 'abcd1234!', keepSignedIn: false }),
    ).resolves.toEqual({ accessToken: 'access-token' })
    expect(apiClient.post).toHaveBeenCalledWith('/auth/seller/login', {
      email: 'demo@magampick.com',
      password: 'abcd1234!',
      keepSignedIn: false,
    })

    // 토글 ON → true 그대로 전송
    await authApi.login({ email: 'demo@magampick.com', password: 'abcd1234!', keepSignedIn: true })
    expect(apiClient.post).toHaveBeenLastCalledWith('/auth/seller/login', {
      email: 'demo@magampick.com',
      password: 'abcd1234!',
      keepSignedIn: true,
    })
  })

  it('로그아웃_API를_호출한다', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ data: undefined })

    await authApi.logout()
    expect(apiClient.post).toHaveBeenCalledWith('/auth/logout')
  })
})

describe('authApi 비밀번호 재설정·변경', () => {
  it('재설정_본인확인은_seller_엔드포인트로_resetToken을_받는다', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ data: { resetToken: 'reset-token' } })

    await expect(
      authApi.verifyPasswordResetIdentity({
        email: 'demo@magampick.com',
        phone: '010-1234-5678',
        verificationToken: 'vtoken',
      }),
    ).resolves.toEqual({ resetToken: 'reset-token' })
    expect(apiClient.post).toHaveBeenCalledWith('/auth/seller/password-resets/verify-identity', {
      email: 'demo@magampick.com',
      phone: '010-1234-5678',
      verificationToken: 'vtoken',
    })
  })

  it('새_비밀번호_저장은_password-resets_confirm으로_호출한다', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ data: undefined })

    await authApi.resetPassword({ resetToken: 'reset-token', newPassword: 'abcd1234!' })
    expect(apiClient.post).toHaveBeenCalledWith('/auth/password-resets/confirm', {
      resetToken: 'reset-token',
      newPassword: 'abcd1234!',
    })
  })

  it('비밀번호_변경은_PATCH_auth_me_password로_호출한다', async () => {
    vi.mocked(apiClient.patch).mockResolvedValue({ data: undefined })

    await authApi.changePassword({ currentPassword: 'Magampick1!', newPassword: 'abcd1234!' })
    expect(apiClient.patch).toHaveBeenCalledWith('/auth/me/password', {
      currentPassword: 'Magampick1!',
      newPassword: 'abcd1234!',
    })
  })
})
