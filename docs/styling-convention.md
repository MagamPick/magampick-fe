# Styling Convention

Tailwind CSS **v4** + shadcn/ui + 디자인 토큰. **토큰 외 값 사용 금지** 로 통일감 강제.

> Tailwind v4 는 **CSS-first** — `tailwind.config.ts` 가 아니라 `globals.css` 의 `@import "tailwindcss"` + `@theme` 로 설정한다. 디자인 토큰은 프로토타입 `../prototype/*/styles/01-tokens.css` 에서 추출 (→ [`prototype-index.md`](prototype-index.md)).

---

## 1. Tailwind v4 셋업 (각 앱)

각 앱 (`apps/customer/`, `apps/seller/`, `apps/admin/`) 동일:

- **설치**: `tailwindcss` + `@tailwindcss/vite`
- **vite.config.ts**: `@tailwindcss/vite` 플러그인
  ```ts
  import tailwindcss from '@tailwindcss/vite'
  export default defineConfig({ plugins: [react(), tailwindcss()] /* ... */ })
  ```
- **CSS 엔트리**: `src/shared/styles/globals.css` — 첫 줄 `@import 'tailwindcss'`
- **main.tsx** 가 `import './shared/styles/globals.css'`

> v3 의 `tailwind.config.ts` / `postcss.config.js` / `@tailwind base/components/utilities` 는 **쓰지 않는다** (v4 에서 제거됨).

---

## 2. 디자인 토큰 — `globals.css` 의 `@theme` + `:root`

토큰은 `globals.css` 에 정의 (프로토타입 `01-tokens.css` 기준):

- `:root {}` — 실제 값 (hex). shadcn 시맨틱(`--primary` 등) + 마감픽 고유(`--cream`·`--success` 등)
- `@theme inline {}` — CSS 변수를 Tailwind 유틸로 노출 (`--color-primary: var(--primary)` → `bg-primary`/`text-primary`)

```css
@import 'tailwindcss';
@import 'tw-animate-css';
@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-primary: var(--primary);
  --color-background: var(--background);
  /* ... shadcn 시맨틱 전부 + 고유(--color-cream/success/warning/info) */
  --radius-lg: var(--radius);
  --font-sans: 'Pretendard', system-ui, sans-serif;
  --text-display: 22px; /* typography scale: display/h2/h3/body/meta/caption */
  --shadow-e1: /* elevation */;
}

:root {
  --radius: 0.75rem;        /* 12px — 프로토 button radius */
  --primary: #ff6b35;
  --background: #f7f7f7;
  /* ... */
}

@layer base {
  * { @apply border-border outline-ring/50; }
  body { @apply bg-background text-foreground font-sans antialiased; }
}
```

### 매핑 (프로토타입 → shadcn 시맨틱)

| shadcn | 값 | | shadcn | 값 |
|---|---|---|---|---|
| `primary` / `-foreground` | #FF6B35 / #FFFFFF | | `secondary`·`accent` | #FFF0EB |
| `background` / `foreground` | #F7F7F7 / #1A1A1A | | `secondary`·`accent`-fg | #E85427 |
| `card`·`popover` | #FFFFFF | | `muted` / `-foreground` | #F1F1F1 / #767676 |
| `destructive` | #DC3545 | | `border`·`input` | #E5E5E5 |
| `ring` | #FF6B35 | | 고유 | success/warning/info/cream/cream-deep |

### 화면 배경 ⚠️ — `bg-card`(흰색)이지 `bg-background`(회색) 아님

페이지/화면 셸의 배경은 **`bg-card`(흰 #fff)** 다. shadcn 관습상 "페이지 배경"처럼 읽히는 **`bg-background`(#f7f7f7 회색)는 페이지 배경이 아니다** — 칩(예: 마이페이지 "수정" 버튼)·플로팅 바텀네비 뒤 같은 좁은 인셋에만 쓴다.

- **함정**: 프로토타입은 흰 화면(`02-base.css` 의 `.screen { background: var(--surface) }`)이고, `--surface`(흰)가 shadcn `--card` 로 리네임돼 `bg-card` 가 된다. 이름(`background`)과 실제 용도가 반대라 **회색으로 까는 실수가 세션마다 반복**됨.
- **강제 (customer)**: 페이지/탭/풀블리드 셸은 `bg-*` 를 직접 고르지 말고 [`ScreenContainer`](../apps/customer/src/shared/components/ScreenContainer.tsx) (`variant="page|tab|bleed"`) 를 쓴다 — `bg-card` 가 박혀 있어 선택 실수가 원천 차단. seller/admin 도 같은 규칙(페이지 배경 = `bg-card`).
- 회색이 맞는지 의심되면 눈대중 말고 프로토타입 `.screen`(또는 화면별 override)이 `--surface`(흰)인지 `--background`(회색)인지 확인.

### 토큰 공유 — 현재 복제, 추후 추출

3앱이 같은 `globals.css` 를 **복제**해서 쓴다 (MVP). 토큰 변경이 잦아지거나 명확히 공유가 필요해지면 root `tokens.css` + 각 앱 `@import` 로 추출 (coding-convention 의 Rule of Three / 점진적 추출). 토큰은 거의 안 바뀌므로 당장은 복제로 단순하게.

---

## 3. shadcn 셋업

`components.json` (각 앱) — aliases 를 우리 폴더 구조(`shared/`)에 매핑:

```json
{
  "style": "new-york",
  "tsx": true,
  "tailwind": { "config": "", "css": "src/shared/styles/globals.css", "baseColor": "neutral", "cssVariables": true },
  "aliases": {
    "ui": "@/shared/components/ui",
    "utils": "@/shared/lib/utils",
    "components": "@/shared/components",
    "lib": "@/shared/lib",
    "hooks": "@/shared/hooks"
  },
  "iconLibrary": "lucide"
}
```

- **`@/` 경로 해석**: shadcn 은 **`tsconfig.json`(루트) 의 `paths`** 를 읽는다 → `tsconfig.json` 에 `"paths": { "@/*": ["./src/*"] }` 필수. **`baseUrl` 은 넣지 않는다** (TS6 에서 deprecated — 없어도 v4 shadcn 이 paths 해석. 넣으면 `tsconfig.app.json` 빌드가 TS5101 로 깨짐)
- 컴포넌트 추가: `pnpm dlx shadcn@latest add button` → `src/shared/components/ui/` 에 생성
- `cn()` → `src/shared/lib/utils.ts` (clsx + tailwind-merge)
- shadcn 컴포넌트는 `cva` variants 도 export → eslint `react-refresh/only-export-components` 에 걸린다. `eslint.config.js` 에서 `src/shared/components/ui/**` 를 그 룰에서 예외 처리 (override 블록 1개)

---

## 4. className 작성 — `cn()` 헬퍼

조건부 클래스 결합은 `clsx` + `tailwind-merge` 의 `cn()` (shadcn 이 `shared/lib/utils.ts` 에 생성):

```ts
// shared/lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

```tsx
import { cn } from '@/shared/lib/utils'

<button className={cn('px-4 py-2 rounded-md', variant === 'primary' && 'bg-primary text-primary-foreground', className)} />
```

`tailwind-merge` 가 충돌 클래스 자동 정리 (`'p-2 p-4'` → `'p-4'`).

---

## 5. 통일감 강제 — 토큰 외 값 금지

```tsx
// ❌ 임의 hex / px 값
<div className="bg-[#FF0000] p-[15px] rounded-[7px]">
<div style={{ color: '#FF0000' }}>

// ✅ 토큰 클래스만
<div className="bg-destructive p-4 rounded-md">
```

이유: 디자인 일관성 / AI 자동완성·lint 가 토큰만 권장 / 토큰 변경 시 한 곳만.

### 예외 — 정말 필요한 일회성
외부 lib 가 정확한 px 를 강제하는 경우만 `[]` 임의값 허용. 사용 시 주석 필수:
```tsx
{/* 카카오맵 SDK 가 정확한 픽셀 컨테이너 요구 */}
<div className="w-[428px] h-[640px]">
```

---

## 6. ESLint / Prettier 플러그인

- **현재 적용**: `eslint.config.js` 에서 `shared/components/ui/**` 를 `react-refresh/only-export-components` 예외 (shadcn `cva` export 때문)
- **도입 예정** (별도): `prettier-plugin-tailwindcss` (클래스 정렬 자동) — Tailwind v4 호환 버전. `eslint-plugin-tailwindcss` 의 v4 지원이 안정화되면 토큰 외 값 검출용으로 추가 검토

---

## 7. 다크모드

`globals.css` 에 `@custom-variant dark (&:is(.dark *))` 만 선언 (v4 방식). 정책:

| MVP | 출시 후 |
|---|---|
| **다크모드 미지원** — `:root` 라이트만 채움, `.dark {}` 블록 없음 | 도입 시 `.dark {}` 추가 + `.dark` 토글 |

→ `@custom-variant dark` 와 CSS 변수 구조는 갖춰져 있어 나중에 도입 비용 작음.

---

## 8. 반응형 — Mobile-First

PWA (customer / seller) 는 모바일 우선. admin 은 데스크탑 우선.

| prefix | min-width | 용도 |
|---|---|---|
| (없음) | 0 | mobile (모든 화면) |
| `sm:` | 640px | landscape 모바일 / 작은 태블릿 |
| `md:` | 768px | 태블릿 |
| `lg:` | 1024px | 데스크탑 |
| `xl:` | 1280px | 큰 데스크탑 |

```tsx
<div className="px-4 lg:px-8">          // mobile 16px / desktop 32px
<div className="flex flex-col lg:flex-row">
```

| 앱 | 기본 |
|---|---|
| `apps/customer` (PWA) | mobile 우선. desktop 은 max-width 컨테이너 |
| `apps/seller` (PWA) | mobile 우선. 사장 작업(상품 등록 등)은 태블릿/desktop 까지 |
| `apps/admin` (일반 웹) | **desktop 우선**. mobile 미지원 |

---

## 9. 전역 스타일 / Reset

`shared/styles/globals.css` 의 `@layer base`:

```css
@layer base {
  * { @apply border-border outline-ring/50; }
  body { @apply bg-background text-foreground font-sans antialiased; }
}
```

Tailwind v4 의 `@import "tailwindcss"` 가 Preflight(기본 reset) 포함 — 추가 reset 거의 불필요.

---

## 10. 폰트 — Pretendard

`index.html` 에 CDN `<link>` (초기). LCP / 보안 위해 추후 자체 호스팅 검토:

```html
<link rel="stylesheet" as="style" crossorigin
  href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" />
```

`@theme` 의 `--font-sans: 'Pretendard', system-ui, sans-serif` → `<body className="font-sans">` (globals 의 `@layer base` 에서 자동 적용).

---

## 11. 아이콘 — `lucide-react`

```tsx
import { ShoppingBag, MapPin } from 'lucide-react'
<ShoppingBag className="w-5 h-5" />
```

- 크기는 **Tailwind 클래스** (`w-5 h-5`) — `size` prop X
- 색은 부모 `text-*` 상속 (`currentColor`)
- 커스텀 SVG → `shared/components/icons/` 에 React 컴포넌트

---

## 12. 애니메이션

shadcn v4 는 **`tw-animate-css`** (`globals.css` 에 `@import 'tw-animate-css'`) — Dialog / Toast 등 자동 애니메이션. (v3 의 `tailwindcss-animate` 대체)

```tsx
<div className="transition-colors hover:bg-primary/90">
```

커스텀 keyframe 은 `@theme` 의 `--animate-*` + `@keyframes`. 복잡한 애니메이션(스크롤/제스처)은 `framer-motion` 별도 검토 (MVP 비범위).

---

## 13. 다국어 / RTL

- **MVP 한국어만** (국내 한정). 다국어 도입 시 `i18next` / react-intl — 그 시점 결정. RTL 미지원.

---

## 14. 안티 패턴

- ❌ **임의 hex / px 값** — `bg-[#FF0000]` / `p-[15px]`. 토큰만.
- ❌ **페이지 배경에 `bg-background`(회색)** — 화면 배경은 `bg-card`(흰). customer 는 `ScreenContainer` 사용 (§2 화면 배경).
- ❌ **`style` prop 인라인** — Tailwind 클래스 + CSS 변수.
- ❌ **CSS Modules / styled-components 혼용** — Tailwind 만.
- ❌ **`@apply` 남용** — 클래스 묶기는 컴포넌트로.
- ❌ **`tailwind.config.ts` 재도입** — v4 는 `@theme`. config 파일 안 만든다.
- ❌ **shadcn 컴포넌트 수정 후 깜빡** — 내 코드라 수정 OK, 다만 commit/주석으로 명확히.
- ❌ **복제된 `shared/components/ui/*` 를 한 앱만 수정** — ui 컴포넌트는 3앱 복제(§2 토큰 복제와 동일 구조)라 한 곳만 고치면 앱 간 drift 발생. 같은 컴포넌트 변경은 customer/seller/admin 에 동일 적용 (예: sheet 배경 `bg-card` 통일). 복제가 잦아지면 §2 의 공유 ui 추출을 앞당기는 신호.
- ❌ **toast/dialog 같은 글로벌 UI 를 페이지마다 직접** — `shared/components/ui` 글로벌 provider 한 곳.

---

## 15. 라이브러리

```json
{
  "tailwindcss": "^4.x",
  "@tailwindcss/vite": "^4.x",
  "tw-animate-css": "^1.x",
  "tailwind-merge": "^3.x",
  "clsx": "^2.x",
  "lucide-react": "^0.x",
  "class-variance-authority": "^0.7.x",
  "radix-ui": "latest"
}
```

`tailwind-merge` / `clsx` / `cva` / `radix-ui` 는 shadcn `add` 시 필요분 자동 설치.

---

## 보류 / TODO

- [x] **디자인 토큰** — 프로토타입 `01-tokens.css` → `globals.css` `@theme`/`:root` 매핑 완료
- [x] **shadcn base color** — `neutral` 기본 위에 프로토타입 토큰으로 시맨틱 변수 덮어씀
- [x] **Pretendard** — CDN `<link>` 적용. 추후 자체 호스팅 검토
- [ ] **토큰 공유 추출** — 현재 3앱 `globals.css` 복제. 변경 빈번/공유 필요 시 root `tokens.css` + `@import` 로
- [ ] **다크모드** — MVP 미지원. `@custom-variant dark` 구조만 준비
- [ ] **`apps/seller` 반응형 범위** — mobile-first 인데 사장 작업은 태블릿/desktop 도. 디자인 팀과 정렬
- [ ] **Tailwind lint/format 플러그인** — `prettier-plugin-tailwindcss` 등 v4 호환 도입 검토

## 변경 이력
- 2026-05-29: 초안 작성 (v3 기준).
- 2026-05-30: Tailwind **v4** 전환 — CSS-first(`@theme`), `@tailwindcss/vite`, baseUrl 없는 shadcn paths, tw-animate-css, 토큰 복제 정책 반영.
- 2026-05-31: 화면 배경 규칙 추가 (페이지/화면 = `bg-card` 흰색, `bg-background` 회색은 인셋만) + customer `ScreenContainer` 도입.
