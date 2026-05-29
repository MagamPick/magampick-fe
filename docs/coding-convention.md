# Coding Convention

마감픽 프론트 코드 구조 / 폴더 / 네이밍 / 파일 배치 룰. 모든 앱 (`customer`, `seller`, `admin`) 동일 적용.

---

## 1. 모노레포 구조

```
magampick-fe/
├── apps/
│   ├── customer/       # 소비자 PWA
│   ├── seller/         # 사장 PWA
│   └── admin/          # 관리자 일반 웹
├── packages/           # 공유 패키지 (현재 비어 있음 — 점진적 추출)
└── pnpm-workspace.yaml
```

### `packages/` 정책 — 점진적

처음엔 비어 있음. 두 번째 앱 만들면서 **명확하게 공유될 코드** 가 보이면 그때 `packages/ui` / `packages/api-client` / `packages/config` 등으로 추출.

> Rule of Three — 같은 코드가 3개 앱에 복붙되는 게 명확해질 때까지 추출 보류. 잘못 추출하면 되돌리기 비용 큼.

> Tailwind 토큰 / TypeScript base 설정 등 진짜 공유 자원은 root 파일로 (`tsconfig.base.json`, `tailwind.config.shared.ts` 등).

---

## 2. 앱 내부 폴더 구조 (Feature-based)

각 앱 (`apps/{name}/src/`) 안은 **도메인별 응집** — 한 도메인의 모든 layer (pages / components / hooks / api / types) 가 한 폴더에.

```
apps/customer/src/
├── app/                       # 앱 셋업
│   ├── App.tsx
│   ├── router.tsx             # 모든 페이지 import → 라우트 정의 (전체 라우트 한눈에)
│   └── providers.tsx          # QueryClientProvider, ThemeProvider 등
├── features/
│   ├── products/
│   │   ├── pages/             # 라우트 진입점 (URL 마다 1개)
│   │   │   ├── ProductListPage.tsx
│   │   │   └── ProductDetailPage.tsx
│   │   ├── components/        # 도메인 컴포넌트 (재사용)
│   │   │   ├── ProductCard.tsx
│   │   │   └── ProductCard.test.tsx
│   │   ├── hooks/             # 도메인 훅 (useQuery / useMutation / Zustand)
│   │   │   ├── useProducts.ts
│   │   │   └── useProductDetail.ts
│   │   ├── api/               # axios 함수 + Zod 응답 검증
│   │   │   └── productApi.ts
│   │   └── types.ts           # 도메인 타입 + Zod 스키마
│   ├── orders/
│   ├── auth/
│   ├── stores/
│   └── ...
├── shared/                    # 여러 feature 가 쓰는 공통
│   ├── components/
│   │   ├── ui/                # shadcn 컴포넌트 (kebab-case 파일 — shadcn CLI 생성)
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   ├── hooks/                 # 공통 훅 (useDebounce 등)
│   ├── lib/                   # axios 인스턴스 / Zod 헬퍼 / 유틸
│   └── types/                 # 공통 타입 (페이지네이션 응답 형식 등)
└── main.tsx                   # Vite 엔트리
```

### `app/` vs `features/` vs `shared/`

| 폴더 | 역할 |
|---|---|
| `app/` | **앱 전역 셋업** — Router / Providers / 엔트리. 도메인 무관. |
| `features/{도메인}/` | **도메인별 모든 것** — pages / components / hooks / api / types. 그 도메인 작업은 이 폴더 1개에서 끝. |
| `shared/` | **여러 feature 가 쓰는 공통** — UI 키트 / 유틸 / 글로벌 axios 인스턴스. 한 feature 만 쓰면 그 feature 안으로. |

### `pages/` 가 `features/` 안에 있는 이유

도메인 응집도. 백엔드 `magampick-api` 의 도메인형 구조와 1:1 매칭:

| 백엔드 도메인형 | 프론트 Feature |
|---|---|
| `users/controller/` | `features/users/pages/` |
| `users/service/` | `features/users/hooks/` |
| `users/repository/` | `features/users/api/` |
| `users/entity/` + `dto/` | `features/users/types.ts` + Zod 스키마 |

라우트 전체 구조는 `app/router.tsx` 한 파일에서 모든 페이지를 import 해서 정의 → 한눈에 보임.

---

## 3. 네이밍

| 종류 | 규칙 | 예시 |
|---|---|---|
| **컴포넌트** | `PascalCase` | `ProductCard`, `OrderDetailPage` |
| **컴포넌트 파일** | `PascalCase.tsx` | `ProductCard.tsx` |
| **훅** | `use` prefix + `camelCase` | `useProducts`, `useDebounce` |
| **훅 파일** | `camelCase.ts` | `useProducts.ts` |
| **일반 함수 / 변수** | `camelCase` | `fetchProducts`, `currentUser` |
| **일반 파일** | `camelCase.ts` | `productApi.ts`, `formatPrice.ts` |
| **타입 / 인터페이스** | `PascalCase` | `Product`, `OrderStatus` |
| **상수** | `SCREAMING_SNAKE_CASE` | `MAX_ITEMS`, `API_BASE_URL` |
| **Zod 스키마 변수** | `camelCase` + `Schema` suffix | `productSchema`, `loginFormSchema` |

### 예외: shadcn 컴포넌트
shadcn CLI 가 자동 생성하는 컴포넌트는 **kebab-case** (`button.tsx`, `dialog.tsx`). 그대로 둠 — `shared/components/ui/` 안에만 존재. 직접 만드는 컴포넌트는 PascalCase 유지.

---

## 4. 파일 콜로케이션

테스트는 **컴포넌트 / 훅 옆에** (`*.test.tsx`, `*.test.ts`):

```
components/
├── ProductCard.tsx
├── ProductCard.test.tsx       # 같은 폴더 — 옆에
└── ProductDetail.tsx

hooks/
├── useProducts.ts
└── useProducts.test.ts
```

> `__tests__/` 폴더 분리는 사용 안 함. React / Vitest 커뮤니티 표준 = 콜로케이션.

스토리북 도입 시 `*.stories.tsx` 도 동일 — 같은 폴더 옆에 (별도 결정 시).

---

## 5. Import

### 절대 경로 `@/` 사용

```ts
// O — 절대 경로
import { ProductCard } from '@/features/products/components/ProductCard'
import { axiosInstance } from '@/shared/lib/axios'

// X — 상대 경로 (단, 같은 폴더 내 import 는 상대 OK)
import { ProductCard } from '../../features/products/components/ProductCard'
```

설정 (각 앱의 `vite.config.ts` + `tsconfig.json`):
```ts
// vite.config.ts
resolve: { alias: { '@': path.resolve(__dirname, './src') } }

// tsconfig.json
"paths": { "@/*": ["./src/*"] }
```

### barrel exports (`index.ts`) 사용 안 함

```ts
// X — barrel
// features/products/index.ts → export * from './components/ProductCard'
import { ProductCard } from '@/features/products'

// O — 명시적 경로
import { ProductCard } from '@/features/products/components/ProductCard'
```

이유:
- import 경로 = 파일 위치. 코드 읽을 때 / Claude / Codex 가 즉시 파악.
- 트리 셰이킹 / 순환 의존성 위험 없음.
- IDE refactor (rename / move) 가 명시 경로에 더 안전.

예외 없음. shadcn 컴포넌트도 한 컴포넌트씩 명시 import.

---

## 6. dev 서버 포트

| 앱 | 포트 |
|---|---|
| `apps/customer` | **5173** (Vite 기본) |
| `apps/seller` | **5174** |
| `apps/admin` | **5175** |

각 앱 `vite.config.ts`:
```ts
server: { port: 5173 }  // 앱별로 다르게
```

3개 동시에 띄워도 충돌 없음. 슬롯에서 추가 인스턴스 띄울 때만 `pnpm dev --port 5180` 식으로 override.

---

## 7. 컴포넌트 작성 룰

- **한 파일에 한 컴포넌트**. (export 1개)
- **props 인터페이스 명시** — 컴포넌트 위에 `interface Props { ... }`.
- **함수형 컴포넌트만** — class 컴포넌트 사용 X.
- **JSX 반환은 단일 root** — 필요시 `<>...</>` (Fragment).
- 컴포넌트가 100줄 넘어가면 분리 검토 (강제 X, 가독성 신호).

```tsx
// features/products/components/ProductCard.tsx
interface Props {
  product: Product
  onClick?: () => void
}

export function ProductCard({ product, onClick }: Props) {
  return (
    <article className="..." onClick={onClick}>
      {/* ... */}
    </article>
  )
}
```

---

## 8. 훅 작성 룰

- **한 파일에 한 훅**. (export 1개)
- **반환은 객체** — 명시적 이름으로 (`{ data, isLoading, error }`). 배열 반환은 `useState` 같은 React 기본 훅 패턴에만.
- **`use` prefix 필수** (React Hooks 규칙).

```ts
// features/products/hooks/useProducts.ts
export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: () => productApi.list()
  })
}
```

---

## 9. 페이지 작성 룰

- 페이지는 **features 의 컴포넌트 / 훅을 조합** — 비즈니스 로직 직접 작성 X.
- 라우트 파라미터 처리 / 페이지 레벨 레이아웃만 페이지 책임.
- 페이지 컴포넌트도 PascalCase + `Page` suffix.

```tsx
// features/products/pages/ProductDetailPage.tsx
export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: product, isLoading } = useProductDetail(id!)

  if (isLoading) return <LoadingSpinner />
  if (!product) return <NotFound />
  return <ProductDetail product={product} />
}
```

---

## 10. `shared/` 세부 구조

| 폴더 | 내용 |
|---|---|
| `shared/components/ui/` | shadcn CLI 생성 컴포넌트 (`button.tsx`, `dialog.tsx`, ...) — kebab-case |
| `shared/components/` | 공통 컴포넌트 (`Header.tsx`, `Footer.tsx`, `LoadingSpinner.tsx`) — PascalCase |
| `shared/hooks/` | 공통 훅 (`useDebounce.ts`, `useLocalStorage.ts`) |
| `shared/lib/` | axios 인스턴스 / Zod 헬퍼 / 유틸 (`axios.ts`, `formatPrice.ts`) |
| `shared/types/` | 공통 타입 (`pagination.ts`, `apiResponse.ts`) |

> 한 feature 만 쓰는 컴포넌트 / 훅 / 유틸은 `shared/` 가 아니라 그 feature 안에.

---

## 11. TypeScript 룰

- **`any` 사용 금지** — 정말 필요하면 `unknown` 으로 받고 좁히기.
- **non-null assertion (`!`) 최소화** — 라우트 파라미터 (`useParams<{id: string}>().id!`) 처럼 명백한 경우만.
- **타입 vs 인터페이스** — 객체 모양은 `interface`, union / 유틸 타입은 `type`. (혼용 OK, 일관성만 유지)
- **유틸 타입 적극 사용** — `Pick`, `Omit`, `Partial`, `Required` 등.

---

## 변경 이력
- 2026-05-29: 초안 작성.
