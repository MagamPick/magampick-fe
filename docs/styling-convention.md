# Styling Convention

Tailwind CSS + shadcn/ui + 디자인 토큰. **토큰 외 값 사용 금지** 로 통일감 강제.

---

## 1. Tailwind 셋업 (각 앱)

각 앱 (`apps/customer/`, `apps/seller/`, `apps/admin/`) 에 동일 구조:

```
apps/customer/
├── tailwind.config.ts         # 앱별 (공유 토큰 import + 앱 특수 토큰)
├── postcss.config.js
└── src/
    └── shared/styles/
        └── globals.css         # @tailwind base/components/utilities + 글로벌 reset + CSS 변수
```

`tailwind.config.ts`:

```ts
import type { Config } from 'tailwindcss'
import sharedTokens from '../../tailwind.config.shared'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      ...sharedTokens,  // 공유 디자인 토큰
      colors: {
        ...sharedTokens.colors,
        // 앱별 특수 색 (있다면)
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),  // shadcn 기본
  ],
} satisfies Config
```

---

## 2. 공유 디자인 토큰 — 모노레포 root

3개 앱이 공통으로 쓰는 토큰은 **root** 에 두고 import:

```
magampick-fe/
├── tailwind.config.shared.ts    # ★ 공유 토큰 (color / spacing / radius / fontSize 등)
├── apps/
│   ├── customer/tailwind.config.ts  → 공유 import
│   ├── seller/tailwind.config.ts    → 공유 import
│   └── admin/tailwind.config.ts     → 공유 import
```

`tailwind.config.shared.ts`:

```ts
export default {
  colors: {
    // 디자인 팀원이 제공한 토큰 매핑
    brand: {
      50: '#...',
      500: '#...',
      900: '#...',
    },
    // shadcn 의 CSS 변수 토큰 — globals.css 에 정의
    border: 'hsl(var(--border))',
    input: 'hsl(var(--input))',
    ring: 'hsl(var(--ring))',
    background: 'hsl(var(--background))',
    foreground: 'hsl(var(--foreground))',
    primary: {
      DEFAULT: 'hsl(var(--primary))',
      foreground: 'hsl(var(--primary-foreground))',
    },
    // ... (shadcn 의 secondary, destructive, muted, accent 등)
  },
  spacing: {
    // 4의 배수 기반 (Tailwind 기본) + 디자인 토큰 추가
    // 예: 'page-x': '1rem' (페이지 좌우 여백)
  },
  borderRadius: {
    lg: 'var(--radius)',
    md: 'calc(var(--radius) - 2px)',
    sm: 'calc(var(--radius) - 4px)',
  },
  fontFamily: {
    // 디자인 토큰 (예: Pretendard)
    sans: ['Pretendard', 'system-ui', 'sans-serif'],
  },
  fontSize: {
    // 디자인 토큰 매핑
  },
}
```

### 셋업 시점

- 첫 앱 (`apps/customer/`) 만들 때 디자인 팀원의 토큰을 받아서 `tailwind.config.shared.ts` 작성
- 이후 두 번째 앱은 그대로 import
- 토큰 변경 = `tailwind.config.shared.ts` 한 곳만 수정 → 3개 앱 모두 반영

---

## 3. shadcn 셋업

각 앱마다 shadcn CLI 초기화:

```sh
cd apps/customer
pnpm dlx shadcn@latest init
```

설정:
- TypeScript: yes
- Style: New York (또는 Default)
- Base color: 디자인 토큰 기준 결정
- CSS variables: yes (필수 — Tailwind 토큰과 CSS 변수 연동)

생성 위치 = `src/shared/components/ui/`. 컴포넌트 추가:

```sh
pnpm dlx shadcn@latest add button input form dialog ...
```

### CSS 변수 정의 — `globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    /* ... 디자인 토큰 기반으로 채움 */
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    /* ... */
  }
}

@layer base {
  * { @apply border-border; }
  body { @apply bg-background text-foreground font-sans antialiased; }
}
```

---

## 4. className 작성 — `cn()` 헬퍼

조건부 클래스 결합은 `clsx` + `tailwind-merge` 의 `cn()` 사용 (shadcn 초기화 시 `lib/utils.ts` 에 생성됨):

```ts
// shared/lib/utils.ts (shadcn 기본)
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### 사용

```tsx
import { cn } from '@/shared/lib/utils'

<button
  className={cn(
    'px-4 py-2 rounded-md font-medium',                  // 기본
    variant === 'primary' && 'bg-primary text-primary-foreground hover:bg-primary/90',
    variant === 'outline' && 'border border-input bg-background',
    disabled && 'opacity-50 cursor-not-allowed',
    className                                              // 외부 props 마지막에 (override 가능)
  )}
>
  {children}
</button>
```

`tailwind-merge` 가 충돌하는 클래스 자동 정리 (예: `'p-2 p-4'` → `'p-4'`).

---

## 5. 통일감 강제 — 토큰 외 값 금지

### 금지

```tsx
// ❌ 임의 hex / px 값
<div className="bg-[#FF0000] p-[15px] rounded-[7px]">
<div style={{ color: '#FF0000', padding: '15px' }}>
```

### 허용

```tsx
// ✅ 토큰 클래스만
<div className="bg-destructive p-4 rounded-md">
```

### 이유

- 디자인 일관성 — 토큰에 없는 값은 디자인 시스템 벗어남
- AI 가 짤 때도 자동완성 / lint 가 토큰만 권장 → 통일감 자동 유지
- 토큰 변경 시 한 곳만 (`tailwind.config.shared.ts`) → 일괄 반영

### 예외 — 정말 필요한 일회성

진짜 어쩔 수 없는 경우 (외부 lib 가 강제하는 정확한 px 등) 만 `[]` 임의값 허용. 사용 시 주석 필수:

```tsx
{/* 카카오맵 SDK 가 정확한 픽셀 컨테이너 요구 */}
<div className="w-[428px] h-[640px]">
```

---

## 6. ESLint / Prettier 플러그인

`eslint-plugin-tailwindcss` + `prettier-plugin-tailwindcss` 도입:

- **클래스 정렬 자동** (`prettier-plugin-tailwindcss`) — `'p-4 bg-red-500 flex'` → `'flex bg-red-500 p-4'` 표준 순서
- **토큰 외 값 검출** (`eslint-plugin-tailwindcss`) — `bg-[#FF0000]` 같은 임의값 경고
- **존재하지 않는 클래스 검출** — 오타 (`bg-primay`) 즉시 잡힘
- **shadcn `cn()` 헬퍼 인식**

상세 설정은 `docs/coding-convention.md` 또는 ESLint config 파일.

---

## 7. 다크모드

shadcn 기본으로 다크모드 지원 (CSS 변수 + `.dark` 클래스). 정책:

| MVP | 출시 후 |
|---|---|
| **다크모드 미지원** — `.dark` 클래스 토글 X | 사용자 요구 / 디자인 팀 결정 시 도입 |

→ shadcn 의 CSS 변수 구조는 미리 갖춰져 있어 나중에 도입 비용 작음.

---

## 8. 반응형 — Mobile-First

PWA (customer / seller) 는 모바일 우선. admin 은 데스크탑 우선.

### Tailwind breakpoint (기본)

| prefix | min-width | 용도 |
|---|---|---|
| (없음) | 0 | mobile (모든 화면) |
| `sm:` | 640px | landscape 모바일 / 작은 태블릿 |
| `md:` | 768px | 태블릿 |
| `lg:` | 1024px | 데스크탑 |
| `xl:` | 1280px | 큰 데스크탑 |

### 패턴

```tsx
// Mobile-first — prefix 없으면 모든 화면 / lg: 부터 데스크탑
<div className="px-4 lg:px-8">          // mobile 16px / desktop 32px
<div className="flex flex-col lg:flex-row">  // mobile 세로 / desktop 가로
```

### 앱별 기본 가정

| 앱 | 기본 |
|---|---|
| `apps/customer` (PWA) | mobile 우선. desktop 은 max-width 컨테이너 (예: 480px 안에) |
| `apps/seller` (PWA) | mobile 우선. 다만 사장 작업 (상품 등록 등) 은 PC 사용 가능성 — 태블릿 / desktop 까지 |
| `apps/admin` (일반 웹) | **desktop 우선**. mobile 미지원 |

---

## 9. 전역 스타일 / Reset

`shared/styles/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root { /* CSS 변수 — shadcn */ }
  * { @apply border-border; box-sizing: border-box; }
  html { -webkit-text-size-adjust: 100%; }
  body { @apply bg-background text-foreground font-sans antialiased; min-height: 100vh; }
  /* iOS Safari 터치 하이라이트 제거 (PWA) */
  button, a { -webkit-tap-highlight-color: transparent; }
}
```

Tailwind 의 `@tailwind base` 가 기본 reset (Preflight) 포함 — 추가 reset 거의 불필요.

---

## 10. 폰트

### 한글 폰트 — Pretendard (추천)

웹폰트로 로드 (CDN 또는 자체 호스팅):

```html
<!-- index.html -->
<link rel="stylesheet" as="style" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css" />
```

또는 자체 호스팅 (LCP / 보안 위해 권장):
```
public/fonts/Pretendard-Regular.woff2
public/fonts/Pretendard-Bold.woff2
```

`globals.css`:
```css
@font-face {
  font-family: 'Pretendard';
  src: url('/fonts/Pretendard-Regular.woff2') format('woff2');
  font-weight: 400;
  font-display: swap;
}
```

### Tailwind 매핑

```ts
// tailwind.config.shared.ts
fontFamily: {
  sans: ['Pretendard', 'system-ui', '-apple-system', 'sans-serif'],
}
```

→ `<body className="font-sans">` 자동 적용.

---

## 11. 아이콘

**`lucide-react`** (shadcn 기본 — shadcn 컴포넌트들이 사용):

```tsx
import { ShoppingBag, MapPin, User } from 'lucide-react'

<ShoppingBag className="w-5 h-5" />
```

### 룰

- 아이콘 크기는 **Tailwind 클래스** (`w-5 h-5`) — `size` prop X (일관성)
- 색은 부모의 `text-*` 컬러 상속 (`currentColor`)
- 커스텀 SVG 가 필요하면 `shared/components/icons/` 에 React 컴포넌트로 작성

```tsx
// shared/components/icons/MagampickLogo.tsx
export function MagampickLogo({ className }: { className?: string }) {
  return <svg className={className}>{/* ... */}</svg>
}
```

---

## 12. 애니메이션

shadcn 의 `tailwindcss-animate` 플러그인 사용 (Dialog / Toast 등 자동 애니메이션). 추가 애니메이션:

```tsx
// Tailwind 기본
<div className="transition-colors hover:bg-primary/90">

// 커스텀 keyframe — tailwind.config 의 theme.extend.keyframes / animation
animation: {
  'fade-in': 'fade-in 0.2s ease-out',
},
keyframes: {
  'fade-in': { from: { opacity: 0 }, to: { opacity: 1 } }
}
```

복잡한 애니메이션 (스크롤 / 제스처 / 시퀀스) 은 `framer-motion` 별도 도입 검토 (MVP 비범위).

---

## 13. 다국어 / RTL

- **MVP 한국어만** ([`product.md` Out of Scope](노션) — 국내 한정)
- 다국어 도입 시 `i18next` 또는 react-intl. 그 시점에 결정.
- RTL (아랍어 등) 미지원

---

## 14. 안티 패턴

- ❌ **임의 hex / px 값** — `bg-[#FF0000]` / `p-[15px]` 금지. 토큰만.
- ❌ **`style` prop 인라인** — `<div style={{...}}>` 금지. Tailwind 클래스 + CSS 변수.
- ❌ **CSS Modules / styled-components 혼용** — Tailwind 만. 일관성.
- ❌ **`@apply` 남용** — Tailwind 의 `@apply` 디렉티브로 클래스 묶기는 가급적 X. 컴포넌트로 묶기.
- ❌ **shadcn 컴포넌트 직접 수정 후 깜빡** — shadcn 은 내 코드라 수정 OK. 다만 어떤 부분 수정했는지 commit / 주석으로 명확히.
- ❌ **toast / dialog 같은 글로벌 UI 를 페이지마다 직접 띄움** — `shared/components/ui/sonner` 같은 글로벌 provider 한 곳에서.

---

## 15. 라이브러리

```json
{
  "tailwindcss": "^3.x",
  "tailwindcss-animate": "^1.x",
  "tailwind-merge": "^2.x",
  "clsx": "^2.x",
  "lucide-react": "^0.x",
  "class-variance-authority": "^0.7.x"  // shadcn 의 variant 정의 (cva)
}
```

shadcn 초기화 시 자동 설치 / `lib/utils.ts` 생성.

---

## 보류 / TODO

- [ ] **디자인 토큰** (color / spacing / borderRadius / fontSize) — 디자인 팀원의 바닐라 JS 프로토타입에서 추출해 `tailwind.config.shared.ts` 에 매핑. 첫 앱 셋업 시점에 진행
- [ ] **shadcn base color** (`shadcn init` 시 선택) — 디자인 토큰 받기 전엔 기본값
- [ ] **Pretendard 호스팅 방식** — CDN vs 자체 호스팅. 초기엔 CDN 후 LCP 보고 자체 호스팅 검토
- [ ] **다크모드 도입 여부** — MVP 미지원. 출시 후 사용자 / 디자인 팀 결정 시 도입 (shadcn 구조는 준비됨)
- [ ] **`apps/seller` 의 반응형 범위** — mobile-first 인데 사장 작업 (상품 등록) 은 태블릿 / desktop 도 자주 사용. 디자인 팀과 정렬 필요

## 변경 이력
- 2026-05-29: 초안 작성.
