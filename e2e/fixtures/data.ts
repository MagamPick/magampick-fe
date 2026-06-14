import { COMMON_PASSWORD } from './env'

/**
 * 데이터 격리 (e2e-plan §1 ★) — 각 테스트가 고유 소비자 계정을 즉석 생성해 병렬 안전.
 * 이메일은 `qa.e2e.*@magampick.test` → _seed/README §7 cleanup 의 `qa.%` 패턴에 포함돼 일괄 정리됨.
 */

let seq = 0

function rand(len: number): string {
  return Math.random()
    .toString(36)
    .slice(2, 2 + len)
}

/** 고유 소비자 계정 자격증명 생성 (worker 프로세스별 seq + 시각 + 난수로 전역 유일) */
export function uniqueCustomer() {
  const n = ++seq
  const stamp = Date.now().toString(36)
  const slug = `${stamp}${rand(4)}-${n}`
  // 휴대폰: 010-XXXX-XXXX (8자리 유사난수) — role 내 unique 제약 회피
  const digits = String(Math.floor(Math.random() * 1e8)).padStart(8, '0')
  return {
    email: `qa.e2e.${slug}@magampick.test`,
    password: COMMON_PASSWORD,
    // 닉네임 2~12자 (중복 허용) — 'e2e' + 6자 난수
    nickname: `e2e${rand(6)}`,
    phone: `010-${digits.slice(0, 4)}-${digits.slice(4)}`,
  }
}

export type CustomerAccount = ReturnType<typeof uniqueCustomer>
