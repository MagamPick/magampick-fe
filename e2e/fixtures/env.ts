/**
 * E2E 대상 환경 상수 (배포된 dev). e2e-plan §0.
 *
 * FE 호스트 (Vercel 배포):
 *   customer = https://dev.magampick.com
 *   seller   = https://owner.dev.magampick.com   (프로토타입 owner-v3 대응)
 *   admin    = https://admin.dev.magampick.com
 * BE = https://api.dev.magampick.com  (axios 가 /api/v1 prefix 부착)
 *
 * 셋 다 *.magampick.com → FE↔BE 는 same-site. refresh_token 쿠키(SameSite=None;Secure;
 * Path=/api/v1/auth) 가 브라우저 XHR(withCredentials)에 자동 동봉 → 쿠키 주입만으로 인증 부팅.
 */
export const TARGETS = {
  customer: 'https://dev.magampick.com',
  seller: 'https://owner.dev.magampick.com',
  admin: 'https://admin.dev.magampick.com',
} as const

export const API_BASE = 'https://api.dev.magampick.com'
export const API_V1 = `${API_BASE}/api/v1`

/** dev 테스트 계정 공통 비번 (_seed/README §1) */
export const COMMON_PASSWORD = 'Magampick1!'

/** dev 휴대폰 OTP mock 코드 (_seed/README §3 — app.sms.mock-enabled) */
export const MOCK_OTP = '000000'

/** 소비자 약관 필수 ID (_seed/README §3: 소비자 [1,2,3,4]) */
export const CUSTOMER_TERM_IDS = [1, 2, 3, 4] as const

/**
 * 지오코딩 통과 확인된 도로명 주소 (검색 경로 — sigunguCode+roadnameCode 전송).
 * 서경대(성북구 서경로) — seed_phaseA ROADS 의 정확매칭 좌표.
 */
export const SEED_ADDRESS = {
  roadAddress: '서울특별시 성북구 서경로 2',
  sigunguCode: '11290',
  roadnameCode: '3107006',
  zonecode: '02712',
} as const

/**
 * 역지오코딩 통과 확인된 GPS 좌표 (GPS 경로 — context.setGeolocation mock + raw 좌표 전송).
 * 강남 테헤란로 105 (reverse-geocode → "서울특별시 강남구 테헤란로 105").
 */
export const SEED_GPS = { latitude: 37.4985273694175, longitude: 127.02855895858346 } as const

/**
 * 관리자 계정 (dev env 시드 — 배포 시크릿 DEV_ADMIN_*). admin 은 단일 공유 계정이라 격리 불가 →
 * 생성 엔티티(이벤트/공지)는 유니크 네이밍으로 병렬 충돌을 피한다. 값은 env override 가능.
 */
export const ADMIN_USERNAME = process.env.E2E_ADMIN_USERNAME ?? 'admin'
export const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? 'password123!'
