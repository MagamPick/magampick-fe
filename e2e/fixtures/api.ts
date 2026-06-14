import type { APIRequestContext } from '@playwright/test'
import {
  ADMIN_PASSWORD,
  ADMIN_USERNAME,
  API_V1,
  COMMON_PASSWORD,
  CUSTOMER_TERM_IDS,
  MOCK_OTP,
  SEED_ADDRESS,
} from './env'

/**
 * BE(api.dev.magampick.com) 직접 호출 헬퍼 — fixtures 전용 (계정 시딩·로그인).
 *
 * Playwright APIRequestContext 는 서버사이드 호출이라 CORS 무관(브라우저 아님).
 * BE envelope 는 { success, data } → 항상 .data 를 깐다.
 */

type CustomerAccount = {
  email: string
  password: string
  nickname: string
  phone: string
}

async function unwrap(res: Awaited<ReturnType<APIRequestContext['post']>>, ctx: string) {
  if (!res.ok()) {
    throw new Error(`[api] ${ctx} 실패 ${res.status()}: ${await res.text()}`)
  }
  const body = (await res.json()) as { success?: boolean; data?: unknown }
  return body.data ?? body
}

/** 휴대폰 인증(dev mock OTP 000000) → verificationToken */
export async function verifyPhone(req: APIRequestContext, phone: string): Promise<string> {
  const data = (await unwrap(
    await req.post(`${API_V1}/auth/phone-verifications/confirm`, {
      data: { phone, code: MOCK_OTP },
    }),
    'phone-verify',
  )) as { verificationToken: string }
  return data.verificationToken
}

/**
 * 소비자 회원가입 (seed_phaseA.py 와 동일 계약). 기본 주소 1개 동반 — 가입 직후 주소 목록=1.
 * 201 + accessToken 반환. (세션 쿠키도 함께 set 되지만 여기선 무시 — 브라우저 컨텍스트에서 재로그인.)
 */
export async function signupCustomer(
  req: APIRequestContext,
  acct: CustomerAccount,
  verificationToken: string,
): Promise<void> {
  await unwrap(
    await req.post(`${API_V1}/auth/signup`, {
      data: {
        email: acct.email,
        password: acct.password,
        nickname: acct.nickname,
        phone: acct.phone,
        verificationToken,
        agreedTermIds: CUSTOMER_TERM_IDS,
        address: {
          label: '집',
          roadAddress: SEED_ADDRESS.roadAddress,
          detailAddress: '101호',
          zonecode: SEED_ADDRESS.zonecode,
          sigunguCode: SEED_ADDRESS.sigunguCode,
          roadnameCode: SEED_ADDRESS.roadnameCode,
        },
      },
    }),
    'customer-signup',
  )
}

/** 휴대폰 인증 + 가입을 묶어 새 소비자 1명을 dev 에 생성 */
export async function createCustomer(req: APIRequestContext, acct: CustomerAccount): Promise<void> {
  const vt = await verifyPhone(req, acct.phone)
  await signupCustomer(req, acct, vt)
}

/**
 * 이메일+비번 로그인. 이 req 컨텍스트의 쿠키 자(jar)에 refresh_token 이 저장된다.
 * 브라우저 BrowserContext.request 로 호출하면 그 컨텍스트의 페이지들이 쿠키를 공유 →
 * page.goto 시 AuthBootstrap silent refresh 로 인증 부팅.
 */
export async function login(
  req: APIRequestContext,
  email: string,
  password = COMMON_PASSWORD,
): Promise<{ accessToken: string }> {
  return (await unwrap(
    await req.post(`${API_V1}/auth/login`, {
      data: { email, password, keepSignedIn: true },
    }),
    'login',
  )) as { accessToken: string }
}

/** 관리자 로그인 — POST /auth/admin/login {username,password}. 쿠키는 req 컨텍스트 자에 적재. */
export async function loginAdmin(req: APIRequestContext): Promise<{ accessToken: string }> {
  return (await unwrap(
    await req.post(`${API_V1}/auth/admin/login`, {
      data: { username: ADMIN_USERNAME, password: ADMIN_PASSWORD },
    }),
    'admin-login',
  )) as { accessToken: string }
}
