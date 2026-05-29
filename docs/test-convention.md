# Test Convention

Vitest + RTL + Playwright. TDD red→green. 단위 / 컴포넌트 / E2E 3단 피라미드.

---

## 1. 테스트 종류

```
        E2E (Playwright)        — 핵심 사용자 흐름만 (느림)
       /                  \
      Component (RTL)        — 주요 컴포넌트 / 페이지 (빠름)
     /                       \
    Unit (Vitest)             — 훅 / 유틸 / API 함수 (가장 빠름)
```

| 종류 | 도구 | 환경 | 적용 범위 |
|---|---|---|---|
| **Unit** | Vitest | jsdom | 훅 / 유틸 함수 / API 함수 / Zod 스키마 |
| **Component** | Vitest + RTL + user-event | jsdom | 컴포넌트 / 페이지 (인터랙션 / 조건부 렌더 / 폼) |
| **E2E** | Playwright | 실제 브라우저 (Chromium) | 핵심 사용자 흐름 4~5개만 |
| **VRT** (Visual Regression) | — | — | **MVP 미도입** (출시 후 검토) |

---

## 2. TDD red → green

`/impl` 워크플로우의 기본. layer 단위 (훅 / 컴포넌트) 마다 반복:

```
1. 테스트 코드 작성 → 실행 → 빨갛게 떨어지는 거 확인 (red)
   - red 안 뜨면 = 테스트가 잘못 작성됨 (구현이 없는데 통과 → 점검)
2. 구현 코드 작성
3. 다시 실행 → 통과 (green)
4. (선택) 리팩터 — 동작 유지하면서 코드 개선
```

### TDD 적용 layer

| Layer | TDD? |
|---|---|
| **훅** (useQuery / useMutation / Zustand) | ✅ red→green |
| **컴포넌트** (RTL) | ✅ red→green |
| **API 함수** (axios + Zod) | ✅ red→green (응답 형식 / 에러 처리) |
| **타입 / Zod 스키마** | ❌ TDD 불가 (시그니처 — 작성 후 typecheck) |
| **페이지** (features 조합) | ❌ E2E 가 커버 |
| **shadcn UI 컴포넌트** | ❌ 라이브러리 일관성 |

자세한 흐름은 [`.claude/skills/impl/SKILL.md §5`](../.claude/skills/impl/SKILL.md).

---

## 3. 파일 위치 — 콜로케이션

테스트는 **소스 옆에** ([`coding-convention.md §4`](coding-convention.md)):

```
features/products/
├── components/
│   ├── ProductCard.tsx
│   └── ProductCard.test.tsx       ← 옆에
├── hooks/
│   ├── useProducts.ts
│   └── useProducts.test.ts        ← 옆에
└── api/
    ├── productApi.ts
    └── productApi.test.ts         ← 옆에
```

E2E 만 별도 디렉터리:
```
apps/customer/
├── src/                            ← 단위 / 컴포넌트 (콜로케이션)
└── e2e/                            ← Playwright (별도)
    ├── auth.spec.ts
    └── order.spec.ts
```

---

## 4. Vitest 셋업

`apps/customer/vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },  // tsconfig paths 와 동일
  },
})
```

`src/test/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => {
  cleanup()  // 테스트 사이 DOM 정리
})
```

### jsdom vs happy-dom

| | jsdom | happy-dom |
|---|---|---|
| **속도** | 보통 | 빠름 (2~3배) |
| **호환성** | 매우 높음 (브라우저 표준에 가까움) | 일부 API 누락 가능 |

→ **jsdom 채택**. 호환성 우선. happy-dom 의 속도 이득은 작은 프로젝트에선 체감 적음.

### 명령

```sh
pnpm test                # watch 모드
pnpm test --run          # 1회 실행
pnpm test --run path/to  # 특정 경로
pnpm test:ui             # Vitest UI (선택)
pnpm test:coverage       # 커버리지
```

---

## 5. Unit 테스트 — 훅 / 유틸

### 순수 함수

```ts
// shared/lib/formatPrice.ts
export function formatPrice(value: number): string {
  return value.toLocaleString('ko-KR') + '원'
}

// shared/lib/formatPrice.test.ts
import { describe, it, expect } from 'vitest'
import { formatPrice } from './formatPrice'

describe('formatPrice', () => {
  it('천_단위_콤마와_원_단위_추가', () => {
    expect(formatPrice(15000)).toBe('15,000원')
  })

  it('0원_처리', () => {
    expect(formatPrice(0)).toBe('0원')
  })
})
```

### TanStack Query 훅

QueryClient 를 wrapper 로 감싸 테스트:

```ts
// features/products/hooks/useProducts.test.ts
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi } from 'vitest'
import { useProducts } from './useProducts'
import { productApi } from '../api/productApi'

vi.mock('../api/productApi')

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },  // 테스트는 retry X
  })
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useProducts', () => {
  it('상품_목록_조회_성공', async () => {
    vi.mocked(productApi.list).mockResolvedValue({
      content: [{ id: 1, name: '빵', price: 5000 }],
      page: 0, size: 20, totalCount: 1, totalPages: 1, hasNext: false, hasPrevious: false,
    })

    const { result } = renderHook(() => useProducts({ page: 0, size: 20 }), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.content).toHaveLength(1)
  })
})
```

### 헬퍼 추출 — `shared/test/createQueryWrapper.ts`

```ts
export function createQueryWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return ({ children }: { children: ReactNode }) =>
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
```

---

## 6. Component 테스트 — RTL + user-event

```tsx
// features/products/components/ProductCard.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProductCard } from './ProductCard'

describe('ProductCard', () => {
  const product = { id: 1, name: '소금빵', price: 4500, imageUrl: null, closingAt: '...' }

  it('상품명과_가격_표시', () => {
    render(<ProductCard product={product} />)
    expect(screen.getByText('소금빵')).toBeInTheDocument()
    expect(screen.getByText('4,500원')).toBeInTheDocument()
  })

  it('클릭_시_onClick_호출', async () => {
    const onClick = vi.fn()
    const user = userEvent.setup()

    render(<ProductCard product={product} onClick={onClick} />)
    await user.click(screen.getByRole('article'))

    expect(onClick).toHaveBeenCalledOnce()
  })
})
```

### 룰

- **접근성 기반 selector 우선** — `getByRole` / `getByLabelText` / `getByText` (`getByTestId` 는 마지막 수단)
- **`user-event` 사용** — `fireEvent` 보다 실제 브라우저 동작에 가까움
- **`screen` 사용** — `container` 직접 접근 X
- **assertion** — `@testing-library/jest-dom` 의 `toBeInTheDocument` / `toHaveTextContent` 등
- **mock 은 명시** — `vi.mock` 으로 의존 모듈 mock

---

## 7. 페이지 테스트 (필요 시)

페이지는 보통 E2E 가 커버. 다만 핵심 로직 (인증 가드 / 폼 제출 분기) 은 컴포넌트 테스트로:

```tsx
import { renderWithProviders } from '@/shared/test/renderWithProviders'

it('비로그인_사용자_로그인_화면_리다이렉트', () => {
  // useAuthStore 의 isAuthenticated = false
  renderWithProviders(<ProtectedRoute><MyPage /></ProtectedRoute>, {
    route: '/mypage'
  })
  expect(screen.getByText('로그인')).toBeInTheDocument()
})
```

`shared/test/renderWithProviders.tsx` 헬퍼 — Router + QueryClient + 필요한 Provider 묶음.

---

## 8. E2E — Playwright

### 셋업

```sh
pnpm dlx playwright install
```

`apps/customer/playwright.config.ts`:

```ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    // PWA 테스트는 모바일 뷰포트 가치 있음
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
})
```

### 핵심 흐름 (앱별)

| 앱 | E2E 핵심 흐름 |
|---|---|
| **customer** | 1) 회원가입 → 자동 로그인 → 메인 / 2) 로그인 → 상품 검색 → 결제 → 주문 내역 / 3) 로그아웃 → 비로그인 상태 |
| **seller** | 1) 사장 회원가입 + 매장 등록 신청 / 2) 마감 임박 상품 등록 → 주문 수락 → 픽업 완료 |
| **admin** | 1) 매장 승인 / 거절 |

→ **나머지 화면은 컴포넌트 테스트** 로 충분. E2E 는 비싸니까 진짜 핵심만.

### 예시

```ts
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test'

test('이메일 로그인 흐름', async ({ page }) => {
  await page.goto('/login')

  await page.getByLabel('이메일').fill('test@magampick.com')
  await page.getByLabel('비밀번호').fill('Test1234!')
  await page.getByRole('button', { name: '로그인' }).click()

  // 로그인 성공 → 홈
  await expect(page).toHaveURL('/')
  await expect(page.getByRole('heading', { name: /환영합니다/ })).toBeVisible()
})
```

### MVP 정책

- **로컬 / CI 에서만 실행** — 백엔드는 docker-compose 또는 mock 서버 (다음 §9)
- **prod 대상 X** — 시뮬레이션만
- E2E 통과 = CI 머지 게이트 (단위 / 컴포넌트와 함께)

---

## 9. Mock — MSW

### 도입 정책

| 영역 | 도구 |
|---|---|
| **단위 테스트** (훅 / API 함수) | `vi.mock('@/features/products/api/productApi')` 직접 모듈 mock |
| **컴포넌트 테스트** | 위와 동일 (훅 / API mock) |
| **E2E** | **MSW** (Mock Service Worker) — 실제 axios 호출 가로채서 mock 응답 |

### MSW 셋업

```sh
pnpm add -D msw
```

`src/test/mocks/handlers.ts`:

```ts
import { http, HttpResponse } from 'msw'

export const handlers = [
  http.post('/api/v1/auth/login', async ({ request }) => {
    const { email } = await request.json()
    if (email === 'fail@test.com') {
      return HttpResponse.json(
        { success: false, error: { code: 'LOGIN_FAILED', message: '...' } },
        { status: 401 }
      )
    }
    return HttpResponse.json({
      success: true,
      data: { accessToken: 'mock-access' }
    })
  }),
  // ... 다른 엔드포인트
]
```

E2E 에서 시작:
```ts
// e2e/setup.ts
import { setupServer } from 'msw/node'
import { handlers } from '../src/test/mocks/handlers'

export const server = setupServer(...handlers)
```

### 정책

- **MSW 핸들러는 단일 진실 (single source)** — 백엔드 응답 envelope / 에러 형식과 일치
- 핸들러 변경 = 백엔드 응답 형식 변경 시 — 자동 추적 (CI 가 잡음)

---

## 10. 한국어 표현

### `describe` / `it`

```ts
describe('ProductCard', () => {                          // 컴포넌트명 (영문)
  it('상품명과_가격_표시', () => { ... })
  it('이미지_없으면_기본_이미지_표시', () => { ... })
})

describe('useLogin', () => {
  it('이메일_비밀번호_로그인_성공', () => { ... })
  it('LOGIN_FAILED_시_동일_메시지_거부', () => { ... })   // 영문 약어는 그대로
})
```

### 룰

- **`describe`** — 컴포넌트 / 훅 / 함수 이름 그대로 (영문)
- **`it`** — **한국어 + 언더바** 사용 (예: `상품_등록_성공`). 백엔드 (`매장_등록_성공`) 와 동일 형식 — 두 레포 검색 / 매칭 통일
- 영문 약어 (에러 코드 / API 경로 / 도구명) 는 그대로 (`LOGIN_FAILED_시_동일_메시지_거부`)

---

## 11. 커버리지

```sh
pnpm test:coverage
```

`vitest.config.ts` 에 coverage 설정:

```ts
test: {
  coverage: {
    provider: 'v8',
    reporter: ['text', 'html'],
    exclude: ['**/*.test.{ts,tsx}', 'src/test/**', 'src/**/*.d.ts'],
  }
}
```

### 정책

- **강제 X** (커버리지 80% 같은 게이트 안 둠)
- **가이드라인** — 핵심 도메인 (auth / orders / payments) 은 70%+, UI 는 자유
- CI 에서 리포트만 — 머지 차단 X

---

## 12. 안티 패턴

- ❌ **`getByTestId` 남용** — 접근성 selector 우선. `data-testid` 는 진짜 마지막 수단
- ❌ **`fireEvent` 직접** — `userEvent.setup()` 사용 (실제 브라우저 동작에 가까움)
- ❌ **`waitFor` 안에 여러 assertion** — 한 assertion 만. 여러 개면 별도 `waitFor`
- ❌ **컴포넌트 / 페이지 안에 직접 mock 데이터** — `src/test/fixtures/` 또는 `__fixtures__/` 별도
- ❌ **`act()` 직접 호출** — RTL / userEvent 가 알아서. 직접 호출 필요하면 비동기 패턴 점검
- ❌ **테스트 사이 상태 공유** — `afterEach(cleanup)` 으로 격리. 글로벌 state (Zustand) 도 reset
- ❌ **mock 응답이 실제 envelope 와 다름** — 백엔드 envelope (`{ success, data }`) 그대로 사용 (MSW 핸들러)

---

## 13. 라이브러리

```json
{
  "vitest": "^1.x",
  "@vitejs/plugin-react": "^4.x",
  "@testing-library/react": "^16.x",
  "@testing-library/user-event": "^14.x",
  "@testing-library/jest-dom": "^6.x",
  "jsdom": "^24.x",
  "@playwright/test": "^1.x",
  "msw": "^2.x"
}
```

---

## 보류 / TODO

- [ ] **E2E 핵심 흐름 4~5개 확정** — 현재는 추정 (가입 / 로그인 / 결제 / 픽업 완료). 노션 명세 페이지 / 핵심 사용자 시나리오 확정 후 실제 E2E 작성
- [ ] **MSW 도입 시점** — E2E 작성 시작 시점. 핸들러는 백엔드 envelope 일치
- [ ] **커버리지 목표** — 현재 강제 X / 가이드 70%. 출시 시점에 도메인별 목표 재검토
- [ ] **모바일 viewport 디바이스 정확화** — 현재 Pixel 5. 디자인 팀 / 타겟 디바이스 확정 시 조정 (iPhone SE 등 추가)
- [ ] **Storybook + VRT 도입** — MVP 비범위. 디자인 시스템 안정화 후 검토

## 변경 이력
- 2026-05-29: 초안 작성.
