# Auth (인증 / 인가)

마감픽 프론트의 인증·인가 정책. **노션 기능 명세 페이지 (single source) 기준**.

> 노션 명세와 백엔드 `magampick-api/docs/auth.md` 가 다르면 **노션이 진실**. 프론트는 노션 따름.

---

## 1. 토큰 모델 — 듀얼 JWT

| | Access Token | Refresh Token |
|---|---|---|
| **만료** | 30분 | 30일 (또는 session) |
| **저장 (클라이언트)** | **메모리만** (Zustand auth 스토어) | **HttpOnly Cookie** + Secure + SameSite |
| **저장 (서버)** | — (stateless) | **Redis** (`refresh:{role}:{id}:{token_id}`, AOF) |
| **전송 (클라이언트→서버)** | `Authorization: Bearer {access}` 헤더 (axios request interceptor 자동) | HttpOnly cookie — 브라우저 자동 (`withCredentials: true`) |
| **갱신** | refresh 로 silent 재발급 | rotation 백로그 (현재 갱신 시 access 만 새로) |

### 왜 이 조합?

- **Access 메모리**: XSS 시에도 탈취 어려움 + 30분 후 자동 만료. localStorage / cookie 사용 X.
- **Refresh HttpOnly Cookie**: 자바스크립트 접근 차단 (XSS 면역). 서버 Redis 와 함께 무효화 가능.
- **새로고침 / 새 탭**: refresh cookie 가 유효하면 **silent 재발급** → 사용자 인지 없이 자동 로그인.

---

## 2. Zustand auth 스토어

`features/auth/stores/authStore.ts`:

```ts
import { create } from 'zustand'

interface User {
  id: number
  role: 'CUSTOMER' | 'SELLER'  // ADMIN 은 별도 (MVP 비범위)
  email: string
  // ... 기타 프로필 필드
}

interface AuthState {
  accessToken: string | null
  user: User | null
  isAuthenticated: boolean

  setAccessToken: (token: string) => void
  setUser: (user: User) => void
  clear: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  isAuthenticated: false,

  setAccessToken: (token) => set({ accessToken: token, isAuthenticated: true }),
  setUser: (user) => set({ user }),
  clear: () => set({ accessToken: null, user: null, isAuthenticated: false }),
}))
```

### 핵심

- **`accessToken` 은 메모리** — 새로고침 시 자동으로 `null` (silent refresh 가 채움)
- **`user` 도 메모리** — 로그인 / silent refresh 후 `/auth/me` 같은 엔드포인트로 채움 (또는 access token decode 로 ID / role 만 즉시)
- **persist 미들웨어 사용 X** — 토큰 localStorage 저장 안 함 (XSS 면역 유지)
- **로그인 상태 유지 토글** 의 값 자체도 메모리 (한 화면 안에서만 의미)

---

## 3. 앱 시작 흐름 (Silent Refresh)

```
1. 앱 부팅 (main.tsx → App.tsx)
2. AuthProvider (또는 layout) 가 refresh 시도:
   POST /api/v1/auth/refresh (body 없음, cookie 자동)
3. 응답:
   - 성공 (200) → accessToken 받음 → Zustand 저장 → 메인 화면
   - 실패 (401 REFRESH_INVALID) → 로그인 화면
4. silent refresh 결과 받을 때까지 "로딩 중" 화면 표시 (깜빡임 방지)
```

```tsx
// app/providers.tsx (개념)
function AuthBootstrap({ children }: { children: ReactNode }) {
  const [isBootstrapping, setIsBootstrapping] = useState(true)
  const setAccessToken = useAuthStore(s => s.setAccessToken)

  useEffect(() => {
    apiClient.post<{ accessToken: string }>('/auth/refresh')
      .then(({ data }) => {
        setAccessToken(data.accessToken)
      })
      .catch(() => {
        // refresh 무효 / 만료 → 비로그인 상태
      })
      .finally(() => setIsBootstrapping(false))
  }, [])

  if (isBootstrapping) return <FullScreenSpinner />
  return <>{children}</>
}
```

---

## 4. 로그인

### 엔드포인트
```
POST /api/v1/auth/login
{
  "email": "...",
  "password": "...",
  "keepSignedIn": true  // 로그인 상태 유지 토글
}
```

### 응답
```
HTTP/1.1 200 OK
Set-Cookie: refresh=eyJ...; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000  (keepSignedIn=true 시 30일)
                                                          ; (없음 — keepSignedIn=false 시 session)

{
  "success": true,
  "data": { "accessToken": "eyJ..." }
}
```

→ envelope unwrap 되면 `data = { accessToken: "..." }`.

### 훅
`features/auth/hooks/useLogin.ts`:

```ts
export function useLogin() {
  const setAccessToken = useAuthStore(s => s.setAccessToken)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (input: LoginInput) => authApi.login(input),
    onSuccess: ({ accessToken }) => {
      setAccessToken(accessToken)
      navigate('/')
    },
  })
}
```

### 에러 처리
- `LOGIN_FAILED` → "이메일 또는 비밀번호가 일치하지 않습니다" (이메일 존재 여부 노출 X)
- `LOGIN_ROLE_MISMATCH` → "이 앱은 {role} 전용입니다" + 해당 앱 안내
- `INVALID_INPUT` → 폼 fieldErrors 표시

---

## 5. 로그인 폼 (react-hook-form + Zod + shadcn `<Form>`)

```ts
// features/auth/types.ts
export const loginInputSchema = z.object({
  email: z.string().email('이메일 형식이 아닙니다'),
  password: z.string().min(1, '비밀번호를 입력해 주세요'), // 필수 여부만 — 구성 규칙 검증 X
  keepSignedIn: z.boolean(),                               // 폼 defaultValues 에서 true
})
export type LoginInput = z.infer<typeof loginInputSchema>
```

> **로그인은 비밀번호 구성 규칙(8자·영문·숫자·특수)을 검증/노출하지 않는다.** 가입 폼은 `passwordSchema`(§8)로
> 강함을 강제하지만, 로그인 폼에서 같은 규칙을 노출하면 ① 비밀번호 정책이 외부에 드러나고 ② 규칙 도입 이전에
> 가입한 계정이 로그인조차 못 하게 된다. 따라서 로그인은 **이메일 형식 + 비밀번호 필수**만 클라이언트에서 보고,
> 실제 자격 판정은 서버가 하여 실패는 `LOGIN_FAILED` 단일 메시지로 거부한다 (계정 존재 여부도 비노출 — §4).

폼은 [`form-convention.md`](form-convention.md) 패턴.

---

## 6. 카카오 OAuth (소비자 전용)

### 엔드포인트
```
POST /api/v1/auth/kakao
{ "kakaoAccessToken": "..." }
```

응답: 일반 로그인과 동일 (`{ accessToken }` + Set-Cookie refresh).

### 프론트 흐름

```
1. [카카오 로그인] 버튼 클릭
2. 카카오 SDK 로 인가 (Kakao.Auth.authorize 또는 카카오 로그인 페이지)
3. 카카오 access token 받음
4. POST /api/v1/auth/kakao + { kakaoAccessToken }
5. 서버 응답: accessToken (+ Set-Cookie refresh) → Zustand 저장 → 메인
```

### 제약

- **소비자 PWA 만 카카오 로그인 버튼 노출**. 사장 PWA 에는 카카오 버튼 없음 (정책: 사장은 이메일+비번만)
- Kakao SDK 초기화 = `shared/lib/kakao.ts` (별도 SDK 래퍼)
- Kakao client ID 환경 변수 = `VITE_KAKAO_CLIENT_ID`

---

## 7. 로그아웃

### 엔드포인트
```
POST /api/v1/auth/logout
Authorization: Bearer {access}
(cookie 자동)
```

응답 시 서버가 Redis refresh 키 삭제 + clear cookie.

### 훅
```ts
export function useLogout() {
  const clear = useAuthStore(s => s.clear)
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      // 성공 / 실패 무관하게 클라이언트 측 정리
      clear()
      queryClient.clear()  // TanStack Query 캐시 전체 비움 (다음 사용자가 이전 데이터 보면 안 됨)
      navigate('/login')
    },
  })
}
```

> 서버 호출 실패해도 클라이언트는 항상 클리어 — 사용자 입장에선 로그아웃됨.

---

## 8. 회원가입

### 흐름

```
1. 휴대폰 인증 (Mock 단계 — §11 참조)
   → POST /auth/phone/request → 인증번호 발송 (Mock: 로그만)
   → POST /auth/phone/verify { phone, code } → verificationToken 발급
2. 이메일 / 비밀번호 / 닉네임 입력
3. POST /auth/signup (소비자) 또는 /auth/seller/signup (사장)
   { email, password, nickname, verificationToken, ... }
4. 응답: 자동 로그인 (accessToken + Set-Cookie refresh)
```

### 비밀번호 룰 (Zod 스키마 공유)

```ts
export const passwordSchema = z.string()
  .min(8, '8자 이상')
  .regex(/[A-Za-z]/, '영문 1자 이상')
  .regex(/\d/, '숫자 1자 이상')
  .regex(/[^A-Za-z\d]/, '특수문자 1자 이상')

// shared/lib/passwordRules.ts 또는 features/auth/types.ts
```

→ 로그인 / 가입 / 비밀번호 변경 / 재설정 다 같은 스키마.

### 사장 가입 추가 필드

`ownerName`, `businessNumber`, `phone` — 입력 폼만 다름 (Zod 스키마는 sellerSignupInputSchema).

---

## 9. 토큰 갱신 (`/auth/refresh`)

### 엔드포인트
```
POST /api/v1/auth/refresh
(body 없음, refresh cookie 자동 송신)
```

### 응답
```json
{
  "success": true,
  "data": { "accessToken": "eyJ..." }  // 새 access 만 (refresh rotation 백로그)
}
```

### 호출 시점

1. **앱 부팅 시 silent refresh** (§3)
2. **401 `TOKEN_EXPIRED` 인터셉터** ([`api-client-convention.md` §5](api-client-convention.md))
3. **명시적 호출** — refresh 만료 임박 시 (선택 — 백그라운드 갱신 필요해질 때만)

### 실패 (`REFRESH_INVALID`)
→ 로그아웃 (auth 스토어 클리어 + 캐시 클리어 + `/login` 리다이렉트)

---

## 10. Route Guard

### 가드 종류

| 종류 | 동작 |
|---|---|
| **인증 가드** | 비로그인 사용자 차단 → `/login` 리다이렉트 |
| **반전 가드** (Public Only) | 로그인 사용자가 `/login`, `/signup` 접근 시 메인으로 리다이렉트 |
| **role 가드** | 진입 PWA 와 role 일치 검증 (백엔드도 검증하지만 클라이언트도 1차 차단) |

### 패턴 — Wrapper 컴포넌트

```tsx
// features/auth/components/ProtectedRoute.tsx
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

// features/auth/components/PublicOnlyRoute.tsx
export function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  if (isAuthenticated) return <Navigate to="/" replace />
  return <>{children}</>
}
```

`router.tsx` 에서 적용:

```tsx
const router = createBrowserRouter([
  {
    element: <PublicOnlyRoute><LoginPage /></PublicOnlyRoute>,
    path: '/login'
  },
  {
    element: <ProtectedRoute><MainLayout /></ProtectedRoute>,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/orders', element: <OrderListPage /> },
      // ...
    ]
  }
])
```

> Loader 패턴 vs Wrapper 패턴 비교는 [`routing-convention.md`](routing-convention.md). 위는 Wrapper 예시.

---

## 11. 휴대폰 본인인증 (Mock)

졸업 단계 = Mock. 외부 API (PASS / NICE 등) 미연동.

### Mock 동작

- 인증번호 = **`000000`** (항상 통과)
- `POST /auth/phone/request` → 서버 로그만, 실제 SMS 발송 X
- `POST /auth/phone/verify { phone, code }` → 무조건 통과 (`code: "000000"` 또는 임의) → `verificationToken` 발급
- 프론트 폼: 휴대폰 번호 입력 + "인증번호 받기" 버튼 + 6자리 입력 필드 + "확인"
- UI 에 Mock 안내 ("졸업 작품 — 인증번호 `000000` 으로 통과") 명시 — 시연 편의

### 출시 시점

외부 API 연동 → 프론트 변경 X (백엔드 인터페이스만 교체).

---

## 12. PWA-role 일치 검증

| PWA | 허용 role |
|---|---|
| `apps/customer` | `CUSTOMER` |
| `apps/seller` | `SELLER` |
| `apps/admin` | `ADMIN` (MVP 비범위 — 추후) |

### 검증 지점

1. **백엔드** — 로그인 요청 시 PWA 식별자 (예: `X-Client: customer`) 헤더 또는 별도 엔드포인트 (`/auth/login` vs `/auth/seller/login`) 로 분기 → 불일치 시 `LOGIN_ROLE_MISMATCH` 응답
2. **프론트** — silent refresh 직후 / 로그인 직후 user.role 검사. 다른 PWA 인데 로그인됐으면 강제 로그아웃 + 안내 ("이 앱은 사장 전용입니다 — 소비자 앱으로 이동하시겠습니까?")

각 PWA `App.tsx` 에 상수:

```ts
// apps/customer/src/app/constants.ts
export const APP_ROLE = 'CUSTOMER' as const

// apps/seller/src/app/constants.ts
export const APP_ROLE = 'SELLER' as const
```

→ `AuthBootstrap` 에서 `user.role !== APP_ROLE` 이면 즉시 로그아웃.

---

## 13. 비밀번호 재설정

비로그인 사용자가 **이메일 → 휴대폰 본인인증 → 새 비밀번호** 3단계로 본인 확인 후 비번을 재설정한다 (소비자·사장 공통). 노션 "비밀번호 재설정" 명세 기준.

### 흐름
1. **이메일** 입력 — 존재 여부 비노출(형식만 검증)
2. **휴대폰 본인인증** (§11 OTP — `usePhoneVerification` 재사용) → 인증 성공 후 이메일↔휴대폰 매칭. 휴대폰 unique X 정책상 (이메일+휴대폰) 쌍으로만 계정 식별 (프로토타입 11-forgot 은 휴대폰만이라 이메일 Step 을 명세대로 추가)
3. **새 비밀번호** (§8 `passwordSchema` 공유) → 갱신 시 해당 계정 refresh 토큰 일괄 무효화 (모든 기기 강제 로그아웃)
4. **완료** → 로그인 화면. **자동 로그인 X** — 새 비번으로 재로그인

### 에러 (노션 AC)
- `RESET_VERIFICATION_FAILED` — 이메일 미등록·이메일↔휴대폰 불일치 동일 메시지 (존재 비노출)
- `PHONE_VERIFICATION_REQUIRED` — 본인인증 토큰 없음/만료
- `SOCIAL_ONLY_ACCOUNT` — 카카오 가입(`password_hash` NULL, 소비자 한정) → "카카오로 로그인" 안내
- `PASSWORD_POLICY_VIOLATION` — 새 비번 정책 미충족

### 진입점 / 라우트
- 로그인 화면 `[비밀번호 찾기]` → `ROUTES.PASSWORD_RESET` (`/password-reset`, PublicOnly)

### Mock (BE 완료 전)
- `authApi.verifyPasswordResetIdentity` / `resetPassword` 스텁 — 등록 계정 시드(이메일+휴대폰)로 매칭, OTP `000000` 통과 (§11). BE 완료 후 실 axios + 이메일↔휴대폰 매칭·refresh 무효화로 교체 (FE 연동 PR).

---

## 13-2. 비밀번호 변경 (로그인 상태)

로그인 사용자가 **현재 비밀번호 확인 → 새 비밀번호** 로 비번을 변경한다 (소비자·사장 공통). 비로그인 §13 재설정과 별개 — 이미 인증된 세션이라 OTP 대신 **현재 비번**으로 본인 확인. 노션 「비밀번호 변경」 명세 기준 (Phase 1 범위 편입 2026-06-03).

### 흐름 (단일 화면)
1. **현재 비밀번호** — 필수. 불일치 시 거부
2. **새 비밀번호** (§8 `passwordSchema` 공유) — 기존 비번과 동일 허용 (강제 변경 규칙 없음, 재설정과 동일)
3. **새 비밀번호 확인** — 새 비번과 일치
4. **완료** → 완료 화면 후 진입점 복귀. **현재 기기 로그인 유지** (재로그인 X). 갱신 시 **다른 기기**의 refresh 만 무효화(현재 기기 제외) — §13 재설정(모든 기기 무효화)과 다름

### 에러
- `CURRENT_PASSWORD_MISMATCH` — 현재 비밀번호 불일치 ("현재 비밀번호가 일치하지 않습니다")
- `PASSWORD_POLICY_VIOLATION` — 새 비번 정책 미충족

### 진입점 / 라우트
- 소비자: 마이 → 내 정보 수정 → `[비밀번호 변경]`
- 사장: 마이 → 설정 → `[비밀번호 변경]`, 또는 마이 → 내 정보 수정 → `[비밀번호 변경]`
- → `ROUTES.PASSWORD_CHANGE` (`/mypage/password`, **ProtectedRoute** — 로그인 전용)

### 소셜 전용 계정 (엣지)
- 카카오 가입(`password_hash` NULL, 소비자 한정)은 현재 비번이 없어 변경 불가 — BE 연동 시 진입 차단/안내(`SOCIAL_ONLY_ACCOUNT`). MVP mock 은 진입점 노출 유지(세션 사용자 type 판별은 BE 영역).

### Mock (BE 완료 전)
- `authApi.changePassword` 스텁 — 현재 비번 `Magampick1!` 통과(그 외 불일치), 새 비번 `passwordSchema` 검증. BE 완료 후 실 axios + 세션 사용자 해시 검증·다른 기기 refresh 무효화로 교체 (FE 연동 PR).

---

## 14. 비범위 / 백로그 (노션 명세 기준)

- **Refresh token rotation** — 갱신 시 새 refresh 발급 + 기존 무효화. 현재 갱신 시 access 만 새로.
- **Access token 블랙리스트** — 만료 짧음 + refresh 무효화로 대체.
- **비밀번호 실패 누적 잠금** — Rate Limiting 영역.
- **회원 탈퇴** — MVP 미포함.
- **관리자 로그인 / 가입** — 관리자 웹 별도 정의 (추후).
- **소셜 추가** (네이버 / 구글) — 카카오만 MVP.
- **2FA** — MVP 미포함.

---

## 15. 환경 변수

| 키 | 용도 |
|---|---|
| `VITE_API_BASE_URL` | 백엔드 root URL |
| `VITE_KAKAO_CLIENT_ID` | 카카오 OAuth client ID (소비자 PWA 만 — `apps/seller`, `apps/admin` 의 `.env` 엔 미포함) |

---

## 16. 보안 체크리스트 (참고)

- ✅ Access 메모리 only (XSS 시 노출 어려움 + 30분 자동 만료)
- ✅ Refresh HttpOnly Cookie (JS 접근 X)
- ✅ `withCredentials: true` (CORS credentials)
- ✅ React JSX 자동 escape (XSS 1차 방어)
- ✅ Zod 입력 검증 (잘못된 형식 차단)
- ✅ HTTPS 강제 (prod, Nginx / ALB termination)
- ⏳ CSP 헤더 (출시 시점 — `Content-Security-Policy: default-src 'self' ...`)
- ⏳ Rate Limiting (백엔드 — 출시 시점)
- ⏳ refresh rotation (백로그)

---

## 보류 / TODO

- [x] **비밀번호 재설정 흐름** — mock UI 구현 완료 (§13, 소비자·사장). BE 연동(실 매칭·refresh 무효화)은 연동 PR 대기
- [x] **비밀번호 변경 (로그인 상태)** — mock UI 구현 완료 (§13-2, 소비자·사장). BE 연동(현재 비번 검증·다른 기기 refresh 무효화)은 연동 PR 대기
- [ ] **소셜 로그인 추가** (네이버 / 구글) — 카카오만 MVP. 노션 명세 따름
- [ ] **관리자 로그인 / 가입** — 관리자 웹 별도 정의 (추후)
- [ ] **Refresh token rotation** — 노션 명세상 백로그. 도입 시점 결정 시 추가
- [ ] **CORS 도메인 / CSP 헤더** — 출시 시점 백엔드와 정렬
- [ ] **PWA-role 일치 검증의 백엔드 시그널** — 헤더 (`X-Client: customer`) vs 분리 엔드포인트 (`/auth/login` vs `/auth/seller/login`) — 백엔드와 정렬

## 변경 이력
- 2026-05-29: 초안 작성 — 노션 명세 (`로그인/로그아웃` 페이지) 기반. 백엔드 docs/auth.md 와 차이 (노션이 진실).
- 2026-05-31: §5 로그인 폼 — 비밀번호 클라이언트 검증을 구성 규칙(strict) → 필수 여부만으로 변경 (정책 노출·구규칙 계정 차단 방지). 소비자 로그인/로그아웃 UI(mock) 구현 중 결정.
- 2026-06-02: §13 비밀번호 재설정 — "MVP 비범위" → mock UI 구현 반영 (이메일→휴대폰 본인인증→새 비번, 소비자·사장). 로그인 [비밀번호 찾기] 진입점 연결. BE 연동 대기.
- 2026-06-03: §13-2 비밀번호 변경 (로그인 상태) 신설 — 노션 「비밀번호 변경」 명세 Phase 1 범위 편입. mock UI (현재 비번→새 비번, 소비자·사장), 성공 후 현재 기기 유지. 마이/내 정보 수정 진입점 연결. BE 연동 대기.
