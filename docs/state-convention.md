# State Convention

서버 상태 (TanStack Query) + 클라이언트 상태 (Zustand) + URL 상태 (useSearchParams) + 로컬 상태 (useState) 4가지 영역 분리.

---

## 1. 상태 종류 — 4가지 분리

| 종류 | 도구 | 예시 |
|---|---|---|
| **서버 상태** | TanStack Query | 상품 목록 / 유저 정보 / 주문 / 매장 상세 |
| **클라이언트 전역 상태** | Zustand | 로그인 상태 (auth) / 다크모드 / 사이드바 open |
| **URL 상태** | React Router `useSearchParams` + Zod | 필터 / 정렬 / 페이지 번호 / 검색어 |
| **로컬 컴포넌트 상태** | `useState` / `useReducer` | 모달 임시 입력 / 토글 / 드래그 좌표 |

### 분류 가이드

질문을 던지자:

1. **"서버에서 받아온 데이터인가?"** → YES = 서버 상태 (TanStack Query)
2. **"URL 새로고침 / 공유 시 유지돼야 하나?"** → YES = URL 상태 (`useSearchParams`)
3. **"여러 컴포넌트가 공유해야 하나?"** → YES = 클라이언트 전역 (Zustand)
4. 위 셋 다 NO → 로컬 상태 (`useState`)

같은 데이터를 두 곳에 두지 않는다. 예: 검색어를 useState 와 URL state 둘 다 두면 동기화 부담 → URL state 한 곳에만.

---

## 2. TanStack Query — QueryClient 셋업

`app/providers.tsx`:

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,            // 1분 — 그 안에 같은 queryKey 호출 시 캐시 반환
      gcTime: 1000 * 60 * 5,            // 5분 — 마지막 사용 후 캐시 제거 시점
      retry: 1,                          // 실패 시 1회만 재시도 (네트워크 에러 등)
      refetchOnWindowFocus: false,       // 윈도우 포커스 시 자동 refetch — 기본 비활성 (필요한 query 만 개별 활성화)
    },
    mutations: {
      retry: 0,                          // mutation 은 재시도 X (중복 실행 위험)
    },
  },
})

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
```

### 정책

| 설정 | 값 | 이유 |
|---|---|---|
| `staleTime` | 1분 | 자주 호출되는 화면에서 불필요한 refetch 차단 |
| `gcTime` | 5분 | 사용자가 떠난 화면 데이터는 5분 후 제거 (메모리 ↓) |
| `retry` | 1 | 일시적 네트워크 에러만 회복 — 비즈니스 에러는 1회 후 사용자에게 보고 |
| `refetchOnWindowFocus` | false | 기본 비활성. 필요 화면만 (예: 주문 진행 상태 — `refetchInterval` 또는 `refetchOnWindowFocus: true` 개별 활성화) |
| `mutations.retry` | 0 | 결제 / 주문 같은 mutation 자동 재시도는 중복 실행 위험 — 사용자 의도적 재시도만 |

> 도메인 특수 조건 (실시간성 필요한 주문 상태 등) 은 그 `useQuery` 에서 개별 override.

---

## 3. queryKey 컨벤션

queryKey 는 **배열** 로 구성. 일관 패턴으로 캐시 무효화 / 식별이 명확.

```ts
['products']                          // 전체 상품 목록 (파라미터 없음)
['products', { page: 0, size: 20 }]   // 페이지네이션
['products', { storeId: 5 }]          // 매장별 상품
['products', 'detail', 42]            // 상품 상세
['orders']                            // 내 주문 목록 (서버가 토큰의 sub 로 분기)
['orders', 'detail', 100]
['stores', 'nearby', { lat, lng }]    // 위치 기반 매장 목록
['auth', 'me']                        // 현재 로그인 사용자 정보
```

### 패턴

```
[도메인, (sub-resource?), (식별자?), (파라미터?)]
```

- **도메인** = 복수형 (`products`, `orders`, `stores`)
- **sub-resource** = `'detail'`, `'list'`, `'nearby'` 등 — 필요 시
- **식별자** = ID
- **파라미터** = 객체 (`{ page, size }`, `{ lat, lng }`)

### 도메인별 헬퍼 (선택)

큰 도메인은 헬퍼 객체로 키 일관성 강제:

```ts
// features/products/hooks/productQueryKeys.ts
export const productQueryKeys = {
  all: ['products'] as const,
  lists: () => [...productQueryKeys.all, 'list'] as const,
  list: (params: ProductListParams) => [...productQueryKeys.lists(), params] as const,
  details: () => [...productQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...productQueryKeys.details(), id] as const,
}

// 사용
useQuery({ queryKey: productQueryKeys.list({ page: 0 }), queryFn: ... })
queryClient.invalidateQueries({ queryKey: productQueryKeys.all })  // products 전체 무효화
queryClient.invalidateQueries({ queryKey: productQueryKeys.lists() })  // 목록만
```

→ 도메인이 작으면 인라인 배열도 OK. **헬퍼는 도메인이 커질 때 추출**.

---

## 4. useQuery 패턴

도메인별 훅으로 감싸 컴포넌트 / 페이지에 노출:

```ts
// features/products/hooks/useProducts.ts
export function useProducts(params: ProductListParams) {
  return useQuery({
    queryKey: productQueryKeys.list(params),
    queryFn: () => productApi.list(params),
  })
}

// features/products/hooks/useProductDetail.ts
export function useProductDetail(id: number) {
  return useQuery({
    queryKey: productQueryKeys.detail(id),
    queryFn: () => productApi.detail(id),
    enabled: !!id,  // id 가 없으면 호출 X
  })
}
```

### 규칙

- **한 파일 한 훅** ([`coding-convention.md` §8](coding-convention.md))
- **queryFn 안에 axios 호출 X** — `productApi.list` 처럼 API 함수만 호출
- **`enabled` 활용** — 의존 값 없으면 비활성 (예: `useProductDetail(undefined)` 호출 시 fetch 안 함)
- **반환은 그대로 `useQuery` 결과** — `{ data, isLoading, error, ... }`. 가공 X (가공은 컴포넌트가 책임)

---

## 5. useMutation + 캐시 무효화

```ts
// features/products/hooks/useCreateProduct.ts
export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateProductInput) => productApi.create(input),
    onSuccess: () => {
      // 생성 후 목록 무효화 → 다음 조회 시 자동 refetch
      queryClient.invalidateQueries({ queryKey: productQueryKeys.lists() })
    },
  })
}

// features/products/hooks/useUpdateProduct.ts
export function useUpdateProduct(id: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateProductInput) => productApi.update(id, input),
    onSuccess: (updated) => {
      // 상세 캐시 직접 업데이트 + 목록 무효화
      queryClient.setQueryData(productQueryKeys.detail(id), updated)
      queryClient.invalidateQueries({ queryKey: productQueryKeys.lists() })
    },
  })
}
```

### 무효화 전략

| 변경 | 무효화 대상 |
|---|---|
| **생성** | `[domain, 'list']` (목록) |
| **수정** | `[domain, 'detail', id]` (상세) + `[domain, 'list']` (목록) |
| **삭제** | `[domain, 'list']` + 캐시 명시 삭제 (`removeQueries`) |
| **상태 전이** (예: 주문 수락) | 영향받는 모든 키 — 도메인별 결정 |

### setQueryData (Optimistic Update)

응답이 오기 전에 캐시 미리 업데이트 → UX 즉시 반영. 실패 시 롤백 (`onError`).

```ts
useMutation({
  mutationFn: ...,
  onMutate: async (input) => {
    await queryClient.cancelQueries({ queryKey: productQueryKeys.detail(id) })
    const previous = queryClient.getQueryData(productQueryKeys.detail(id))
    queryClient.setQueryData(productQueryKeys.detail(id), { ...previous, ...input })
    return { previous }
  },
  onError: (_err, _input, context) => {
    if (context?.previous) queryClient.setQueryData(productQueryKeys.detail(id), context.previous)
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: productQueryKeys.detail(id) })
  },
})
```

→ **결제 / 주문 같은 중요 변경엔 optimistic 안 씀** (사용자에게 명확한 성공 / 실패 피드백 필요). 토글 / 즐겨찾기 같은 가벼운 변경에만.

---

## 6. useInfiniteQuery (무한 스크롤)

백엔드 `SliceResponse<T>` 응답 활용.

```ts
export function useInfiniteProducts(params: Omit<ProductListParams, 'page'>) {
  return useInfiniteQuery({
    queryKey: productQueryKeys.infinite(params),
    queryFn: ({ pageParam }) => productApi.list({ ...params, page: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.page + 1 : undefined),
  })
}

// 사용
const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteProducts({ size: 20 })
const items = data?.pages.flatMap(p => p.content) ?? []
```

→ 페이지네이션 / 무한 스크롤 선택은 노션 명세 결정 따름.

---

## 7. 에러 처리

### 컴포넌트 레벨

```tsx
const { data, isLoading, error } = useProducts(params)

if (isLoading) return <Spinner />
if (error) return <ErrorView error={error} />   // ApiError 타입
if (!data) return null

return <ProductList products={data.content} />
```

### 글로벌 에러 처리 — `QueryCache` 옵션

```ts
const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      if (error instanceof ApiError && error.code === 'FORBIDDEN') {
        toast.error('권한이 없습니다')
      }
      // 다른 에러는 컴포넌트가 책임
    }
  })
})
```

→ **공통 에러 (`FORBIDDEN` / 네트워크 / 등)** 만 글로벌. 도메인 에러는 컴포넌트가.

---

## 8. Zustand — 스토어 구조

### 도메인별 스토어 분리

한 거대한 스토어 X. **도메인별로 작게**:

```
features/auth/stores/authStore.ts          # 로그인 상태 / 토큰 / 유저
features/ui/stores/uiStore.ts              # 사이드바 / 다크모드 / 모달
features/cart/stores/cartStore.ts          # 장바구니 (만약 사용 시 — 노션 명세 따름)
```

또는 한 feature 안에 있으면 `features/{domain}/stores/{name}Store.ts`. 여러 feature 가 공유하면 `shared/stores/{name}Store.ts`.

### 작성 패턴

```ts
// features/ui/stores/uiStore.ts
import { create } from 'zustand'

interface UIState {
  sidebarOpen: boolean
  isDarkMode: boolean

  toggleSidebar: () => void
  toggleDarkMode: () => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  isDarkMode: false,

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  toggleDarkMode: () => set((s) => ({ isDarkMode: !s.isDarkMode })),
}))
```

### 규칙

- **타입 인터페이스 명시** (상태 + 액션)
- **액션은 같은 객체에** (상태 / 액션 분리 X — Zustand 권장 패턴)
- **selector 사용** — 컴포넌트에서 필요한 필드만 구독해서 불필요한 리렌더 방지:
  ```tsx
  const sidebarOpen = useUIStore((s) => s.sidebarOpen)        // O — 이 값만 변할 때 리렌더
  // const state = useUIStore()                                // X — 어떤 필드 변해도 리렌더
  ```

### Persist (미들웨어)

| 데이터 | persist? |
|---|---|
| **auth (토큰 / 유저)** | ❌ — XSS 면역 위해 메모리만 ([`auth.md`](auth.md)) |
| **UI 설정 (다크모드 / 언어)** | ✅ — `persist` 미들웨어로 localStorage 저장 |
| **장바구니 (만약 사용)** | 노션 명세 따름 (보통 X — 서버 동기화 또는 sessionStorage) |

```ts
// 예: UI 설정만 persist
import { persist } from 'zustand/middleware'

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({ ... }),
    { name: 'magampick-ui' }
  )
)
```

---

## 9. URL 상태 — useSearchParams + Zod

검색어 / 필터 / 정렬 / 페이지는 **URL 에**. 새로고침 / 공유 시 유지 + 뒤로가기 자연스러움.

```ts
// shared/lib/useUrlState.ts (헬퍼 — 도메인 커지면 추출)
import { useSearchParams } from 'react-router-dom'
import { z } from 'zod'

const productListParamsSchema = z.object({
  page: z.coerce.number().min(0).default(0),
  size: z.coerce.number().min(1).max(100).default(20),
  sort: z.string().default('createdAt,desc'),
  category: z.string().optional(),
})

// features/products/pages/ProductListPage.tsx
function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const params = productListParamsSchema.parse(Object.fromEntries(searchParams))

  const { data } = useProducts(params)

  // 필터 변경
  function setCategory(category: string) {
    setSearchParams({ ...Object.fromEntries(searchParams), category })
  }
  // ...
}
```

### 규칙

- **모든 URL 파라미터는 Zod 스키마로 검증** — 잘못된 값 (음수 페이지 등) 즉시 거부 또는 기본값
- **`z.coerce`** 사용 — URL 은 무조건 string 이라 number 변환 필요
- **Zod 스키마는 features 안에 같이 둠** (`features/products/types.ts` 에 정의 후 페이지에서 사용)
- 라우터 라이브러리 단위 패턴 (React Router 7) 디테일은 [`routing-convention.md`](routing-convention.md)

---

## 10. 로컬 상태 — useState

다른 영역 다 아니면 `useState`:

```tsx
function ProductCard({ product }) {
  const [isHovered, setIsHovered] = useState(false)  // 마우스 hover — 컴포넌트 안에서만
  // ...
}
```

- 컴포넌트 안에서만 의미
- 새로고침 / 공유 / 다른 컴포넌트와 무관
- 가장 가볍게

복잡한 다단계 상태는 `useReducer` — 폼은 react-hook-form 이 따로 처리하니 useReducer 직접 쓸 일 드뭄.

---

## 11. auth 스토어 + TanStack Query 협력

### 401 처리 흐름 (이미 axios interceptor 가 처리, [`api-client-convention.md` §5](api-client-convention.md))

```
1. useQuery 실행 → axios 호출 → 401 TOKEN_EXPIRED
2. interceptor 가 /auth/refresh 호출 → 새 access → Zustand 갱신
3. 원래 요청 재시도 → 성공 → data 반환
4. useQuery 컴포넌트는 정상 데이터 받음 (refresh 인지 안 함)
```

### 로그아웃 시 캐시 전체 클리어

```ts
const queryClient = useQueryClient()
const clear = useAuthStore(s => s.clear)

function logout() {
  await authApi.logout()
  clear()
  queryClient.clear()  // ★ 다음 사용자가 이전 유저 데이터 보면 안 됨
  navigate('/login')
}
```

### `useAuthStore` 구독으로 query enabled 제어

```ts
export function useMyOrders() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)

  return useQuery({
    queryKey: ['orders', 'me'],
    queryFn: () => orderApi.myList(),
    enabled: isAuthenticated,  // 비로그인 시 호출 X
  })
}
```

---

## 12. DevTools

- **TanStack Query DevTools** — `<ReactQueryDevtools />` providers 에 포함. dev 환경에서 좌하단 버튼.
- **Zustand DevTools** — Redux DevTools 호환. 필요시 `devtools` 미들웨어:
  ```ts
  import { devtools } from 'zustand/middleware'
  export const useStore = create<...>()(devtools((set) => ({ ... }), { name: 'storeName' }))
  ```

prod 빌드엔 자동 제외 (TanStack DevTools 는 tree-shake, Zustand devtools 는 명시 분기).

---

## 13. 안티 패턴

- ❌ **서버 데이터를 Zustand 에 복사** — 서버 응답은 항상 TanStack Query 캐시에만. 두 곳에 두면 동기화 부담.
- ❌ **`useEffect + fetch` 직접** — TanStack Query 의 캐싱 / refetch / 에러 다 잃음. 항상 `useQuery`.
- ❌ **거대한 단일 스토어** — Zustand 는 도메인별로 작게 쪼개기. Redux 스타일의 한 store / 여러 slice 패턴 X.
- ❌ **컴포넌트에서 axios 직접 호출** — 항상 `useQuery` / `useMutation` 거치기.
- ❌ **`queryClient.setQueryData` 남용** — 일반적으로 `invalidateQueries` 가 더 안전 (서버와 동기화). `setQueryData` 는 optimistic update 같은 명확한 경우만.

---

## 보류 / TODO

- [ ] **`staleTime` / `gcTime` 기본값** (1분 / 5분) — 운영 시 트래픽 / UX 보고 조정
- [ ] **`refetchOnWindowFocus` 기본 false** — 실시간성 필요 화면 (마감 임박 상품 / 주문 진행 상태) 은 개별 활성화. 어느 화면이 그런지는 노션 명세 / 화면 작업 시 결정
- [ ] **queryKey 헬퍼 (`productQueryKeys`) 추출 시점** — 도메인이 커질 때 점진적
- [ ] **글로벌 에러 처리 정책** — 현재 `FORBIDDEN` 만 예시. 다른 공통 에러 (네트워크 / 5xx 등) 도 글로벌 할지 운영 시 결정
- [ ] **Optimistic update 대상** — "결제/주문 X, 토글/즐겨찾기 O" 가이드. 정확한 대상은 노션 명세별로

## 변경 이력
- 2026-05-29: 초안 작성.
