import { request, type APIRequestContext } from '@playwright/test'
import { API_V1 } from './env'
import { login } from './api'
import type { CustomerAccount } from './data'

/**
 * 주소 시드 헬퍼 (API). 소비자에게 **코드 경로(다음 위젯)** 주소를 추가한다.
 *
 * 왜 API 시드인가: UI 로 2번째 주소를 추가하는 자동화 경로는 (1) 다음 우편번호 위젯=외부 팝업(자동 불가)
 * (2) GPS=BUG-A(zonecode null→목록 parse throw) 둘뿐이라, set-default/delete/limit 처럼 "2개 이상"이
 * 전제인 케이스를 UI 로만 깔면 버그에 막힌다. → 코드 경로 주소(sigunguCode+roadnameCode+zonecode 동반)는
 * BE 가 zonecode 를 채워 돌려줘 BUG-A 와 무관 → API 로 깔아 격리된 상태를 만든다.
 */

export const SEOKYUNG_4 = {
  label: '회사',
  roadAddress: '서울특별시 성북구 서경로 4',
  detailAddress: '201호',
  zonecode: '02712',
  sigunguCode: '11290',
  roadnameCode: '3107006',
} as const

export const SEOKYUNG_6 = {
  label: '학교',
  roadAddress: '서울특별시 성북구 서경로 6',
  detailAddress: '301호',
  zonecode: '02712',
  sigunguCode: '11290',
  roadnameCode: '3107006',
} as const

async function createAddress(
  api: APIRequestContext,
  token: string,
  input: Record<string, unknown>,
): Promise<void> {
  const res = await api.post(`${API_V1}/customers/me/addresses`, {
    headers: { Authorization: `Bearer ${token}` },
    data: input,
  })
  if (!res.ok()) throw new Error(`[seed] createAddress 실패 ${res.status()}: ${await res.text()}`)
}

/** 소비자 계정에 코드경로 주소 N개를 API 로 시드 (가입 기본 주소 외 추가) */
export async function seedCodeAddresses(
  account: CustomerAccount,
  inputs: ReadonlyArray<Record<string, unknown>>,
): Promise<void> {
  const api = await request.newContext()
  try {
    const { accessToken } = await login(api, account.email, account.password)
    for (const input of inputs) await createAddress(api, accessToken, input)
  } finally {
    await api.dispose()
  }
}
