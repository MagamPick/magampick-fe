# API Client Convention

axios + Zod 기반 백엔드 API 호출 패턴. 토큰 자동 첨부 / 401 자동 refresh / 에러 정규화 / 응답 envelope unwrap / Zod 검증.

> 백엔드 (`magampick-api`) 의 응답 envelope / 에러 코드 / 페이지네이션 형식 기준. 백엔드와 정렬됨.

---

## 1. 백엔드 응답 envelope (참고)

모든 백엔드 응답은 통일된 envelope 로 감싸짐 (`ApiResponse<T>` + `ResponseBodyAdvice`).

### 성공
```json
{
  "success": true,
  "data": { /* 실제 페이로드 */ }
}
```

### 실패
```json
{
  "success": false,
  "error": {
    "code": "STORE_NOT_FOUND",
    "message": "매장을 찾을 수 없습니다",
    "timestamp": "2026-05-13T10:00:00+09:00",
    "fieldErrors": [
      { "field": "name", "message": "공백일 수 없습니다" }
    ]
  }
}
```

- `fieldErrors` 는 `INVALID_INPUT` (400) 에만 존재. 그 외는 없음.
- DELETE 성공 응답 (`204 No Content`) 은 envelope 없이 빈 body.

→ 프론트는 **interceptor 에서 envelope 자동 unwrap** → 도메인 코드 / Zod 스키마는 `data` 만 다룸.

---

## 2. axios 인스턴스 (단일)

```ts
// shared/lib/axios.ts
import axios from 'axios'
import { env } from './env'

export const apiClient = axios.create({
  baseURL: `${env.VITE_API_BASE_URL}/api/v1`,  // 환경변수는 도메인만, /api/v1 은 여기서
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,  // refresh HttpOnly cookie 자동 송수신 — auth.md 의 듀얼 JWT 정책
})
```

- `VITE_API_BASE_URL` = 백엔드 root (예: `https://api.magampick.com` 또는 `http://localhost:8080`)
- `/api/v1` 은 axios baseURL 에 고정 — 도메인 코드에선 `/stores`, `/products/123` 같은 경로만
- `withCredentials: true` — refresh token 은 **HttpOnly Cookie** 로 주고받음 (자바스크립트 접근 X). 백엔드 CORS 가 `Access-Control-Allow-Credentials: true` + `Access-Control-Allow-Origin` 명시 도메인 (와일드카드 X) 으로 설정돼야 함.

---

## 3. 환경 변수 (Zod 검증)

앱 시작 시 검증 — 누락 / 잘못된 값은 즉시 throw.

```ts
// shared/lib/env.ts
import { z } from 'zod'

const envSchema = z.object({
  VITE_API_BASE_URL: z.string().url(),
  // 새 환경 변수는 여기에 추가
})

export const env = envSchema.parse(import.meta.env)
```

`.env.example` 에 모든 키 + 예시값 명시 (실제 `.env*` 는 .gitignore).

---

## 4. Request Interceptor — 토큰 자동 첨부

```ts
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken  // 메모리에 있는 access only
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

- **Access token 만** Bearer 헤더로 첨부. Zustand auth 스토어 메모리에서 가져옴 (`docs/auth.md`).
- **Refresh token 은 HttpOnly cookie** → 브라우저가 자동 송신 (코드 X). `withCredentials: true` 가 활성화돼 있어 자동 동작.
- 토큰 없으면 그대로 (public 엔드포인트 — `/auth/login`, `/auth/signup` 등)

---

## 5. Response Interceptor — envelope unwrap + 401 refresh

```ts
let isRefreshing = false
let refreshQueue: Array<(token: string) => void> = []

apiClient.interceptors.response.use(
  // 성공 — envelope unwrap
  (res) => {
    if (!res.data || typeof res.data !== 'object') return res
    if (res.data.success === true && 'data' in res.data) {
      res.data = res.data.data
    }
    return res
  },

  // 실패
  async (error) => {
    const originalRequest = error.config

    // 401 → refresh 시도 (access 만료 추정)
    if (error.response?.status === 401 && !originalRequest._retry) {
      const code = error.response?.data?.error?.code

      // TOKEN_EXPIRED 만 refresh 시도. INVALID_TOKEN / LOGIN_FAILED / REFRESH_INVALID 는 곧장 로그아웃
      if (code === 'TOKEN_EXPIRED') {
        originalRequest._retry = true

        if (isRefreshing) {
          return new Promise((resolve) => {
            refreshQueue.push((newToken) => {
              originalRequest.headers.Authorization = `Bearer ${newToken}`
              resolve(apiClient(originalRequest))
            })
          })
        }

        isRefreshing = true
        try {
          // refresh cookie 는 자동 송신 (withCredentials). body 비움.
          const { data } = await apiClient.post<{ accessToken: string }>('/auth/refresh')
          const newAccessToken = data.accessToken  // envelope unwrap 됨

          useAuthStore.getState().setAccessToken(newAccessToken)
          refreshQueue.forEach((cb) => cb(newAccessToken))
          refreshQueue = []
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
          return apiClient(originalRequest)
        } catch (refreshError) {
          // refresh 자체가 401 (REFRESH_INVALID / 만료) → 로그아웃
          useAuthStore.getState().clear()
          window.location.href = '/login'
          return Promise.reject(refreshError)
        } finally {
          isRefreshing = false
        }
      }
    }

    return Promise.reject(normalizeError(error))
  }
)
```

핵심:
- **envelope unwrap 자동** — 도메인 코드는 `data` 만 받음
- **`TOKEN_EXPIRED` 만 refresh 시도** — `INVALID_TOKEN` / `LOGIN_FAILED` / `LOGIN_ROLE_MISMATCH` / `REFRESH_INVALID` 는 곧장 로그아웃 또는 폼 에러
- **refresh 호출 body 없음** — refresh token 은 HttpOnly cookie 로 자동 전송. 응답에 새 access 만 옴 (refresh rotation 은 백로그 — 노션 명세)
- **동시 401 mutex+큐**: 첫 401 만 refresh, 나머지는 대기열에서 새 토큰 받으면 재시도
- **`_retry` 플래그**: 무한 루프 방지

> refresh 흐름 / 로그인·로그아웃 / 토큰 저장 디테일은 [`docs/auth.md`](auth.md).

---

## 6. 에러 정규화 (`ApiError`)

백엔드 `ErrorResponse` 구조 그대로 매핑.

```ts
// shared/lib/apiError.ts
export interface FieldError {
  field: string
  message: string
}

export class ApiError extends Error {
  constructor(
    public readonly status: number | null,
    public readonly code: string,
    message: string,
    public readonly fieldErrors?: FieldError[],
    public readonly cause?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export function normalizeError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return new ApiError(null, 'NETWORK_ERROR', '네트워크 연결을 확인해주세요', undefined, error)
    }
    const { status, data } = error.response
    const backendError = data?.error
    return new ApiError(
      status,
      backendError?.code ?? 'UNKNOWN',
      backendError?.message ?? `서버 오류 (${status})`,
      backendError?.fieldErrors,
      error
    )
  }
  return new ApiError(null, 'UNKNOWN', '알 수 없는 오류', undefined, error)
}
```

### 주요 에러 코드 (노션 명세 정렬)

| HTTP | code | 의미 | 처리 |
|---|---|---|---|
| 400 | `INVALID_INPUT` | 검증 실패 | `fieldErrors` 표시 (폼 필드별 에러) |
| 401 | `LOGIN_FAILED` | 이메일 미등록 / 비밀번호 불일치 (동일 메시지 — 계정 존재 노출 차단) | 폼 에러 표시 |
| 401 | `LOGIN_ROLE_MISMATCH` | 진입 PWA 와 role 불일치 (사장 앱에 customer 등) | 폼 에러 표시 + 안내 |
| 401 | `TOKEN_EXPIRED` | Access 만료 | **자동 refresh** (위 §5) |
| 401 | `INVALID_TOKEN` | 서명 오류 / 변조 | 로그아웃 → /login |
| 401 | `REFRESH_INVALID` | Refresh 만료 / 무효화 (로그아웃 / Redis 삭제 후) | 로그아웃 → /login |
| 403 | `FORBIDDEN` | 권한 부족 | 안내 메시지 |
| 404 | `*_NOT_FOUND` | 리소스 없음 | 안내 메시지 / 이전 화면 |
| 409 | 도메인별 | 비즈니스 룰 위반 (이미 취소된 주문 등) | 안내 메시지 |

전체 코드는 노션 기능 명세 페이지에서 확인.

---

## 7. Zod 응답 검증

interceptor 에서 envelope 가 unwrap 되므로 **도메인 스키마는 data 만 검증**.

```ts
// features/products/types.ts
import { z } from 'zod'

export const productSchema = z.object({
  id: z.number(),
  name: z.string(),
  price: z.number(),
  imageUrl: z.string().url().nullable(),
  closingAt: z.string().datetime({ offset: true }),  // ISO 8601 + offset (KST)
})

export type Product = z.infer<typeof productSchema>
```

```ts
// features/products/api/productApi.ts
import { apiClient } from '@/shared/lib/axios'
import { productSchema } from '../types'

export const productApi = {
  async detail(id: number): Promise<Product> {
    const res = await apiClient.get(`/products/${id}`)
    return productSchema.parse(res.data)  // res.data 는 이미 unwrap 된 data
  },
}
```

검증 실패 → Zod 가 throw → TanStack Query 의 `error` 로 전달.

### 7-1. 생성 타입 (`@magampick/api-types`) 참조

API 요청/응답 타입은 백엔드 SpringDoc spec 에서 생성한 **`@magampick/api-types`** (group별 entry: `/customer`, `/seller`) 를 **우선 참조**한다. 손으로 타입을 옮겨 적지 않는다.

- **역할 분리**: 생성 타입 = 백엔드 계약(컴파일 정합·드리프트 방지), **Zod 스키마 = 런타임 진실 게이트**. 생성 타입이 있어도 응답 검증은 그대로 Zod 가 담당 (§7).
- **envelope**: 생성 타입은 unwrap 이후 `data` 형태 (SpringDoc 이 컨트롤러 반환 타입만 문서화) → interceptor 출력과 그대로 맞음.
- **재생성 (백엔드 연동 작업 시작 시)**: 백엔드 spec 변경이 있었으면 먼저 재생성 → `git diff` 확인 후 커밋.
  ```sh
  pnpm --filter @magampick/api-types gen          # 기본 dev 백엔드
  # base override: MAGAMPICK_API_DOCS_BASE=http://localhost:8080 pnpm --filter @magampick/api-types gen
  ```
- **Zod 를 생성 타입에 맞춤**: `components['schemas']['XResponse']` 를 정답지로 두고, `z.infer<typeof xSchema> satisfies components['schemas']['XResponse']` 로 정합을 컴파일 체크.
- **점진 마이그레이션**: 기존 손작성 타입을 한 번에 갈아끼우지 않는다. 새/수정 feature 부터 생성 타입 참조. 상세·사용법 = [`packages/api-types/README.md`](../packages/api-types/README.md).

---

## 8. 페이지네이션 응답 (PageResponse / SliceResponse)

백엔드가 두 가지 wrapper 사용. 프론트도 Zod 헬퍼로 매핑.

```ts
// shared/types/pagination.ts
import { z } from 'zod'

export function pageResponseSchema<T extends z.ZodTypeAny>(item: T) {
  return z.object({
    content: z.array(item),
    page: z.number(),
    size: z.number(),
    totalCount: z.number(),
    totalPages: z.number(),
    hasNext: z.boolean(),
    hasPrevious: z.boolean(),
  })
}

export function sliceResponseSchema<T extends z.ZodTypeAny>(item: T) {
  return z.object({
    content: z.array(item),
    page: z.number(),
    size: z.number(),
    hasNext: z.boolean(),
  })
}

export type PageResponse<T> = z.infer<ReturnType<typeof pageResponseSchema<z.ZodType<T>>>>
export type SliceResponse<T> = z.infer<ReturnType<typeof sliceResponseSchema<z.ZodType<T>>>>
```

사용:

```ts
// features/stores/types.ts
export const storeSchema = z.object({ ... })
export const storeListSchema = pageResponseSchema(storeSchema)  // 일반 페이지네이션
// 또는
export const storeFeedSchema = sliceResponseSchema(storeSchema)  // 무한 스크롤
```

```ts
// features/stores/api/storeApi.ts
export const storeApi = {
  async list(params: { page: number; size: number }): Promise<PageResponse<Store>> {
    const res = await apiClient.get('/stores', { params })
    return storeListSchema.parse(res.data)
  },
}
```

### 페이지네이션 쿼리 파라미터

| 파라미터 | 설명 | 기본값 |
|---|---|---|
| `page` | 페이지 번호 (0-based) | 0 |
| `size` | 페이지 크기 | 20 |
| `sort` | `field,direction` (`createdAt,desc`). 여러 개 가능 | API 별 |

→ 일반 페이지네이션 (페이지 번호) 은 `useQuery`, 무한 스크롤은 `useInfiniteQuery` (TanStack Query) 사용. 디테일은 `docs/state-convention.md`.

---

## 9. 날짜 / 시간

- 백엔드 응답 / 요청 다 ISO 8601 + KST offset (`2026-05-13T10:00:00+09:00`)
- Zod: `z.string().datetime({ offset: true })`
- 표시는 `date-fns` 또는 `Intl.DateTimeFormat` (라이브러리 별도 결정 — `docs/coding-convention.md` 외)
- **`Date` 객체로 변환은 표시 직전에만** — Zustand / Query 캐시 / props 전달 시점엔 ISO string 그대로

---

## 10. API 함수 작성 패턴

도메인별 `features/{도메인}/api/{도메인}Api.ts` 에 **객체 형태**:

```ts
export const productApi = {
  list(params: { page: number; size: number }): Promise<PageResponse<Product>> { ... },
  detail(id: number): Promise<Product> { ... },
  create(input: CreateProductInput): Promise<Product> { ... },
  update(id: number, input: UpdateProductInput): Promise<Product> { ... },
  remove(id: number): Promise<void> { ... },
}
```

규칙:
- 함수명은 **의미 기반** — `list` / `detail` / `create` / `update` / `remove` (또는 도메인 특화 동사 — `placeOrder`, `cancelOrder`, `acceptOrder`)
- 모든 함수에 **명시적 반환 타입** (`Promise<...>`)
- request body 가 있으면 **`{Action}Input`** 타입 + Zod 스키마 (`createProductInputSchema`)
- 함수 안에서는 axios 호출 → Zod parse → 반환만. **비즈니스 로직 X**
- 백엔드 URL 의 역할별 prefix (`/seller/...`, `/admin/...`) 는 그대로 함수 안 path 에 반영

---

## 11. 훅과의 연동 (TanStack Query)

API 함수는 직접 컴포넌트가 호출 X — **반드시 hooks 를 거쳐**:

```ts
// features/products/hooks/useProducts.ts
import { useQuery } from '@tanstack/react-query'
import { productApi } from '../api/productApi'

export function useProducts(params: { page: number; size: number }) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productApi.list(params),
  })
}
```

```ts
// features/products/hooks/useCreateProduct.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: productApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}
```

> 캐시 무효화 / queryKey 컨벤션 / 에러 핸들링은 `docs/state-convention.md`.

---

## 12. axios 직접 호출 금지

컴포넌트 / 페이지에서 **`apiClient` 또는 `axios` 직접 호출 X**. 항상:

```
컴포넌트 → 훅 (useQuery / useMutation) → API 함수 → apiClient
```

이유:
- 캐싱 / 에러 / 로딩 일관 처리 (TanStack Query)
- Zod 검증 누락 방지
- 테스트 시 mock 지점 단일화

---

## 13. mock / 테스트

- 단위 테스트: `vi.mock('@/features/products/api/productApi')` 로 API 함수 자체 mock
- 통합 테스트 / Storybook: **MSW (Mock Service Worker)** 도입 검토 — 실제 axios 호출 가로채서 mock 응답 반환

> MSW 도입 여부 / 핸들러 위치는 `docs/test-convention.md` 에서 결정.

---

## 14. 외부 API (토스페이 / 카카오맵 / FCM)

마감픽 외부 의존 (노션 명세 / 백엔드 외부연동) 은 **별도 클라이언트**:

- 토스페이: 결제 SDK (`@tosspayments/payment-sdk`)
- 카카오맵: `kakao.maps.*` 전역 객체
- FCM: `firebase/messaging`

→ `shared/lib/{vendor}.ts` 에 초기화 함수 + 래퍼. axios `apiClient` 와 분리.

---

## 변경 이력
- 2026-05-29: 초안 작성 + 백엔드 envelope / 에러 / 페이지네이션 / KST 정렬.
