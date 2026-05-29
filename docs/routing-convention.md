# Routing Convention

React Router v7 기반. `createBrowserRouter` + 데이터 라우터 (loader 는 제한적) + Wrapper 가드 + Zod 타입 안전.

---

## 1. 셋업

`app/router.tsx`:

```tsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute'
import { PublicOnlyRoute } from '@/features/auth/components/PublicOnlyRoute'
import { MainLayout } from '@/shared/components/MainLayout'
import { HomePage } from '@/features/home/pages/HomePage'
import { ProductDetailPage } from '@/features/products/pages/ProductDetailPage'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { NotFoundPage } from '@/shared/components/NotFoundPage'
// ... 모든 페이지 import (라우트 한눈에 보임)

export const router = createBrowserRouter([
  {
    element: <PublicOnlyRoute><LoginPage /></PublicOnlyRoute>,
    path: '/login',
  },
  {
    element: <ProtectedRoute><MainLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <HomePage /> },
      { path: '/products/:id', element: <ProductDetailPage /> },
      { path: '/orders', element: <OrderListPage /> },
      { path: '/orders/:id', element: <OrderDetailPage /> },
      { path: '/mypage', element: <MyPage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])

// app/App.tsx
export function App() {
  return <RouterProvider router={router} />
}
```

### 핵심

- **모든 페이지를 `router.tsx` 가 import** — 라우트 구조 한눈에 (Feature-based 구조의 단점 보완)
- **Wrapper 가드** (`<ProtectedRoute>`) 로 인증 분기
- **`<MainLayout>`** = Header / Sidebar / Footer 등 공통 레이아웃. `<Outlet />` 으로 자식 라우트 렌더
- **404** = `path: '*'` 마지막에

---

## 2. 라우트 정의 위치

| 항목 | 위치 |
|---|---|
| 라우트 정의 (`createBrowserRouter`) | `app/router.tsx` (각 앱마다 1개) |
| 페이지 컴포넌트 | `features/{도메인}/pages/{Name}Page.tsx` |
| 가드 컴포넌트 | `features/auth/components/ProtectedRoute.tsx` 등 |
| 공통 레이아웃 | `shared/components/MainLayout.tsx` |
| 라우트 경로 상수 | `shared/lib/routes.ts` (선택 — §6 참조) |

---

## 3. URL 파라미터 — Zod 검증

`useParams` 의 결과는 string 타입이지만 **존재 여부 / 형식 보장 X** — Zod 로 검증.

```tsx
// features/products/pages/ProductDetailPage.tsx
import { z } from 'zod'
import { useParams, useNavigate } from 'react-router-dom'

const paramsSchema = z.object({
  id: z.coerce.number().int().positive(),
})

export function ProductDetailPage() {
  const params = useParams()
  const navigate = useNavigate()

  const parsed = paramsSchema.safeParse(params)
  if (!parsed.success) {
    navigate('/', { replace: true })
    return null
  }

  const { id } = parsed.data  // number 타입 보장
  const { data: product } = useProductDetail(id)
  // ...
}
```

### 규칙

- **`useParams<{id: string}>()` 제네릭만으론 부족** — 런타임 검증 필수 (URL 직접 입력 / 변조 가능)
- **`z.coerce.number()`** — URL 의 string `"123"` → number
- **검증 실패 시 즉시 리다이렉트** — `navigate('/', { replace: true })` 또는 404 페이지로
- 도메인이 커지면 `paramsSchema` 를 `features/{도메인}/types.ts` 로 이동

### 헬퍼 (선택)

여러 페이지에서 같은 패턴 반복되면 `shared/lib/useTypedParams.ts`:

```ts
export function useTypedParams<T extends z.ZodTypeAny>(schema: T): z.infer<T> | null {
  const params = useParams()
  const result = schema.safeParse(params)
  return result.success ? result.data : null
}
```

---

## 4. 검색 파라미터 — useSearchParams + Zod

[`state-convention.md §9`](state-convention.md) 와 동일.

```ts
// features/products/types.ts
export const productListParamsSchema = z.object({
  page: z.coerce.number().min(0).default(0),
  size: z.coerce.number().min(1).max(100).default(20),
  sort: z.string().default('createdAt,desc'),
  category: z.string().optional(),
})
export type ProductListParams = z.infer<typeof productListParamsSchema>
```

```tsx
// features/products/pages/ProductListPage.tsx
function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const params = productListParamsSchema.parse(Object.fromEntries(searchParams))

  const { data } = useProducts(params)

  function updateParams(patch: Partial<ProductListParams>) {
    setSearchParams({
      ...Object.fromEntries(searchParams),
      ...Object.fromEntries(Object.entries(patch).map(([k, v]) => [k, String(v)])),
    })
  }
  // ...
}
```

---

## 5. Route Guard

[`auth.md §10`](auth.md) 에 패턴 정의됨. 요약:

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

### 패턴 선택 — Wrapper vs Loader

| 방식 | 장점 | 단점 |
|---|---|---|
| **Wrapper 컴포넌트** (현재 채택) | 직관적 / 디버깅 쉬움 / Zustand 구독으로 실시간 반영 | 라우트 정의가 약간 verbose |
| **Loader** (`loader: () => { if (!auth) throw redirect('/login') }`) | 라우트 정의 깔끔 / 데이터 prefetch 패턴과 통합 | Zustand 직접 구독 어려움 (loader 는 컴포넌트 밖) |

→ **Wrapper 채택** — auth 상태 Zustand 직접 구독 / silent refresh 와 자연 연동.

---

## 6. 라우트 경로 상수 / Link 타입 안전

문자열 라우트 경로를 코드 곳곳에 적으면 오타 / 변경 시 깨짐 위험. **상수 + 헬퍼**:

```ts
// shared/lib/routes.ts
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',

  PRODUCT_DETAIL: (id: number) => `/products/${id}`,
  ORDER_LIST: '/orders',
  ORDER_DETAIL: (id: number) => `/orders/${id}`,

  MYPAGE: '/mypage',
} as const
```

### 사용

```tsx
import { Link, useNavigate } from 'react-router-dom'
import { ROUTES } from '@/shared/lib/routes'

<Link to={ROUTES.PRODUCT_DETAIL(product.id)}>상품 상세</Link>

const navigate = useNavigate()
navigate(ROUTES.HOME)
```

### 규칙

- **하드코딩 금지** — `<Link to="/products/123">` X, `<Link to={ROUTES.PRODUCT_DETAIL(123)}>` O
- **라우트 정의 (`router.tsx`) 에선 그대로 문자열** (`path: '/products/:id'`) — 동적 상수로 만들면 가독성 ↓
- 상수는 정적 경로 ↔ 동적 경로 (함수) 혼합. 함수는 인자 타입으로 안전성 확보

---

## 7. 코드 스플리팅 (lazy)

큰 페이지 / 자주 안 들어가는 페이지는 lazy load 로 번들 분리.

```tsx
import { lazy } from 'react'

const MyPage = lazy(() => import('@/features/mypage/pages/MyPage').then(m => ({ default: m.MyPage })))
const OrderDetailPage = lazy(() => import('@/features/orders/pages/OrderDetailPage').then(m => ({ default: m.OrderDetailPage })))

const router = createBrowserRouter([
  {
    element: <Suspense fallback={<FullScreenSpinner />}><Outlet /></Suspense>,
    children: [
      { path: '/mypage', element: <MyPage /> },
      { path: '/orders/:id', element: <OrderDetailPage /> },
    ],
  },
])
```

### 정책

- **자주 진입하는 페이지** (홈 / 상품 목록 / 로그인) = **즉시 import** (초기 로드 빠름)
- **자주 안 들어가는 페이지** (마이페이지 / 설정 / 도움말) = **lazy**
- **무거운 페이지** (지도 / 결제 / 통계) = **lazy**

MVP 초기엔 다 즉시 import 도 OK. 번들 크기가 커지면 분할.

---

## 8. Nested Routes + Layout

공통 레이아웃 (Header / Footer / Sidebar) 은 부모 라우트로 묶음:

```tsx
{
  element: <ProtectedRoute><MainLayout /></ProtectedRoute>,
  children: [
    { index: true, element: <HomePage /> },
    { path: '/orders', element: <OrderListPage /> },
    {
      path: '/mypage',
      element: <MyPageLayout />,  // 마이페이지 전용 sidebar 같은 거
      children: [
        { index: true, element: <MyPageHome /> },
        { path: 'orders', element: <MyOrders /> },
        { path: 'settings', element: <MySettings /> },
      ]
    }
  ]
}
```

`<MainLayout>` 안에 `<Outlet />` 으로 자식 라우트 렌더:

```tsx
function MainLayout() {
  return (
    <div>
      <Header />
      <main><Outlet /></main>
      <Footer />
    </div>
  )
}
```

---

## 9. Loader 패턴 — 제한적 사용

React Router v7 의 `loader` 는 페이지 진입 전 데이터 prefetch 가능. **사용은 제한적**:

| 영역 | Loader 사용? |
|---|---|
| 인증 가드 | ❌ Wrapper 컴포넌트 (Zustand 구독) |
| 일반 데이터 fetch | ❌ TanStack Query (`useQuery`) 가 더 강력 |
| URL 파라미터 검증 | ❌ 페이지 컴포넌트 안에서 Zod parse |
| **잠깐의 정적 데이터** (예: 카테고리 목록) | 선택 — loader 도 OK |

→ **거의 모든 데이터는 TanStack Query 로**. loader 는 가드 / 정적 prefetch 같은 특수 케이스만.

이유: loader 는 캐싱 / refetch / 에러 처리가 TanStack Query 대비 약함. 두 도구 섞으면 동기화 복잡.

---

## 10. 페이지 전환

```tsx
// 컴포넌트 안
const navigate = useNavigate()

navigate(ROUTES.HOME)                    // 이동
navigate(ROUTES.LOGIN, { replace: true }) // 히스토리 교체 (뒤로가기 X)
navigate(-1)                              // 뒤로 한 단계
```

### 리다이렉트 (선언적)
```tsx
if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} replace />
```

→ 가드 / 조건부 리다이렉트는 `<Navigate>` 권장 (렌더 중 안전).

### 로그인 후 원래 경로로 돌아가기

```tsx
// ProtectedRoute 에서
const location = useLocation()
return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />

// LoginPage 에서 로그인 성공 시
const location = useLocation()
const from = (location.state as { from?: Location })?.from?.pathname ?? ROUTES.HOME
navigate(from, { replace: true })
```

---

## 11. 404 / NotFound

```tsx
// shared/components/NotFoundPage.tsx
export function NotFoundPage() {
  return (
    <div>
      <h1>페이지를 찾을 수 없습니다</h1>
      <Link to={ROUTES.HOME}>홈으로</Link>
    </div>
  )
}

// router.tsx 끝에
{ path: '*', element: <NotFoundPage /> }
```

리소스별 NotFound (상품 없음 등) 는 페이지 컴포넌트 안에서 자체 처리:
```tsx
const { data: product, isLoading } = useProductDetail(id)
if (isLoading) return <Spinner />
if (!product) return <NotFoundPage />
```

---

## 12. 라우트 헬퍼 — `EnterWorktree` 같은 거 없음

React Router 에 별도 헬퍼 X. 위의 `ROUTES` 상수 + `useTypedParams` 정도면 충분.

라우트가 50개+ 되면 코드 생성 / 타입 안전 헬퍼 (TanStack Router) 고려 — 그 시점에 마이그레이션 검토.

---

## 13. 안티 패턴

- ❌ **하드코딩된 경로 문자열** — `navigate('/products/' + id)` X. `ROUTES.PRODUCT_DETAIL(id)` 사용
- ❌ **`useParams` 결과 그대로 사용** — Zod 검증 없이 `params.id!` X. 변조 / 잘못된 URL 위험
- ❌ **Loader 안에 비즈니스 fetch** — TanStack Query 가 책임
- ❌ **가드를 페이지 컴포넌트 안에서 매번 직접** — `<ProtectedRoute>` Wrapper 일관 사용
- ❌ **`<a href="...">` 사용** — `<Link to="...">` (SPA 라우팅 — 전체 페이지 reload X)

---

## 14. 라이브러리

```json
{
  "react-router-dom": "^7.x"
}
```

> v7 부터 `react-router-dom` / `react-router` 패키지 통합 — `react-router-dom` 만 의존 추가하면 됨.

---

## 보류 / TODO

- [ ] **lazy import 도입 시점** — MVP 초기엔 즉시 import. 번들 사이즈 보고 화면별 lazy 결정
- [ ] **TanStack Router 마이그레이션** — 라우트 50+ 시점 검토. 현재는 React Router v7
- [ ] **로그인 후 원래 경로 복귀** (`location.state.from`) — 실제 시나리오 (`/checkout` 진입 시 로그인 강제 → 결제로 복귀 등) 명세 따라 구현

## 변경 이력
- 2026-05-29: 초안 작성.
