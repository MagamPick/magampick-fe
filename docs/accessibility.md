# Accessibility (a11y)

MVP 단계 — **저비용 고가치 5개** 만 룰로 박음. shadcn / Radix UI 가 절반 이상 자동 처리.

---

## 1. MVP 정책

| # | 룰 | 비용 |
|---|---|---|
| 1 | **시맨틱 HTML** 사용 | 0 |
| 2 | **키보드 네비게이션** 보장 (shadcn / Radix 자동) | 0 |
| 3 | **`alt` 텍스트** 명시 | 0 |
| 4 | **폼 라벨 연결** (shadcn `<FormLabel>` 자동) | 0 |
| 5 | **명도 대비 WCAG AA** (4.5:1) | 디자인 토큰에서 |

위 5개만 강제. 검증 도구 (`axe-core` 등) 도입 / WCAG AAA / 완벽한 스크린 리더 지원은 **출시 후**.

---

## 2. 시맨틱 HTML

올바른 태그 사용 — `<div>` 남용 금지.

| 영역 | 사용 태그 |
|---|---|
| 헤더 / 네비 | `<header>` + `<nav>` |
| 메인 | `<main>` (페이지당 1개) |
| 사이드 | `<aside>` |
| 푸터 | `<footer>` |
| 섹션 단위 | `<section>` (제목 있는 경우) |
| 아티클 / 카드 | `<article>` |
| 버튼 | **`<button>`** (`<div onClick>` 절대 X) |
| 링크 | `<a>` (React Router `<Link>` 가 자동) |
| 목록 | `<ul>` / `<ol>` / `<li>` |
| 폼 입력 | `<input>` / `<textarea>` / `<select>` |
| 제목 계층 | `<h1>` → `<h2>` → `<h3>` (건너뛰지 않음) |

### 예시

```tsx
// X — 의미 없는 div 남용
<div onClick={handleClick}>제출</div>
<div className="navigation">{/* 메뉴들 */}</div>

// O — 시맨틱
<button onClick={handleClick}>제출</button>
<nav>{/* 메뉴들 */}</nav>
```

---

## 3. 키보드 네비게이션

### shadcn / Radix UI 가 처리해주는 것

- `<Dialog>` — Tab 트랩 / Esc 닫기 / Focus return
- `<Select>` / `<DropdownMenu>` — 화살표 키 네비 / Enter 선택 / Esc 닫기
- `<Tabs>` — 좌우 화살표 키 / Home / End
- `<Form>` + `<Input>` — Tab 진행 / Enter 제출

→ shadcn 컴포넌트 사용 시 **추가 작업 거의 0**.

### 직접 만든 컴포넌트 룰

- 모든 인터랙티브 요소는 **`<button>` 또는 `<a>`** (자동 focusable)
- 커스텀 클릭 핸들러는 `<button>` 로 감싸기
- 포커스 표시 (`outline`) **제거 금지**:
  ```css
  /* X */ button { outline: none; }
  /* O */ button:focus-visible { @apply ring-2 ring-ring; }
  ```

shadcn 의 `focus-visible:ring-*` 패턴 그대로 사용.

---

## 4. 이미지 — alt 텍스트

```tsx
// O
<img src={product.imageUrl} alt={`${product.name} 상품 사진`} />

// 장식용 (의미 없음) — 빈 alt
<img src="/decoration.svg" alt="" />

// X — alt 누락
<img src={product.imageUrl} />
```

### 규칙

- **모든 `<img>` 에 `alt` 속성 필수** (빈 문자열이라도)
- **의미 있는 이미지** = 내용 설명 (`{product.name} 상품 사진`)
- **장식용 이미지** = 빈 alt (`alt=""`) — 스크린 리더가 무시
- **아이콘 (lucide-react)** — 아이콘만 있는 버튼은 `aria-label` 필수:
  ```tsx
  <button aria-label="장바구니 열기">
    <ShoppingBag />
  </button>
  ```

---

## 5. 폼 — 라벨 연결

shadcn `<Form>` 컴포넌트가 자동 처리:

```tsx
<FormField name="email" render={({ field }) => (
  <FormItem>
    <FormLabel>이메일</FormLabel>          {/* htmlFor 자동 */}
    <FormControl><Input {...field} /></FormControl>
    <FormDescription>로그인에 사용</FormDescription>  {/* aria-describedby 자동 */}
    <FormMessage />                         {/* aria-invalid 자동 */}
  </FormItem>
)} />
```

shadcn 의 `<FormItem>` 이:
- `<FormLabel>` 의 `htmlFor` ↔ `<Input>` 의 `id` 자동 연결
- 에러 시 `aria-invalid` / `aria-describedby` 자동
- 도움말 (`<FormDescription>`) 도 `aria-describedby` 로 연결

→ shadcn `<Form>` 만 사용하면 폼 a11y 거의 다 해결. 직접 `<input>` + `<label>` 작성 X.

---

## 6. 명도 대비 — WCAG AA

| 요소 | 최소 명도 대비 (전경:배경) |
|---|---|
| 일반 텍스트 | **4.5:1** |
| 큰 텍스트 (18pt+ 또는 14pt+ bold) | **3:1** |
| UI 컴포넌트 / 그래픽 (버튼 테두리 등) | **3:1** |

### 검증 방법

- **디자인 토큰 정의 시점에 확인** — `tailwind.config.shared.ts` 의 brand / primary / muted 등 컬러 페어가 AA 통과 검증
- 도구: WebAIM Contrast Checker / Chrome DevTools 의 Color Picker
- 디자인 팀원과 정렬 (디자인 토큰 받을 때 같이 확인)

### 흔한 함정

- **`text-muted` 가 너무 옅음** — 디폴트 회색 (gray-400 등) 이 배경 흰색 위에서 AA 안 통과할 수 있음 → 토큰 정의 시 검증
- **placeholder 색** — 보통 회색이라 안 통과. 정상 (placeholder 는 보조 정보 — 라벨 / 도움말이 진짜 정보)
- **호버 / 비활성 상태** — 모든 state 가 AA 통과해야 (호버 시 더 옅어지는 거 위험)

---

## 7. 포커스 관리

- 모달 열릴 때 첫 입력 / 버튼에 포커스 (shadcn `<Dialog>` 자동)
- 모달 닫힐 때 트리거 버튼으로 포커스 복귀 (shadcn 자동)
- 라우트 이동 시 페이지 최상단 또는 `<main>` 으로 포커스 이동 (선택 — MVP 비범위)

---

## 8. 안티 패턴

- ❌ **`<div onClick>`** — `<button>` 사용. 키보드 / 스크린 리더 / focusable 자동
- ❌ **`outline: none` / `*:focus { outline: 0 }`** — 키보드 사용자가 포커스 못 봄. shadcn 의 `focus-visible:ring-*` 패턴 사용
- ❌ **alt 없는 `<img>`** — 의미 없으면 `alt=""`, 의미 있으면 설명
- ❌ **`<label>` 없는 `<input>`** — shadcn `<FormField>` 만 사용하면 자동
- ❌ **클릭 가능한데 `<a href="#">`** — 진짜 링크면 `<Link>`, 액션이면 `<button>`
- ❌ **명도 대비 검증 없이 토큰 확정** — 디자인 토큰 받을 때 AA 검증
- ❌ **아이콘만 있는 버튼에 `aria-label` 누락** — `<button aria-label="...">`

---

## 9. 출시 후 검토 (현재 비범위)

- **검증 도구** — `axe-core` / `@axe-core/react` 통합 + Storybook a11y 애드온
- **스크린 리더 실 테스트** — NVDA (Windows) / VoiceOver (macOS / iOS) / TalkBack (Android)
- **ARIA 풀 적용** — `aria-live` (실시간 알림) / `aria-busy` (로딩) / `role` 수동 지정
- **WCAG AAA** (7:1 대비)
- **모션 줄이기** (`prefers-reduced-motion`) — 멀미 사용자 배려
- **다국어 + RTL** — 한국어만 (Out of Scope)

---

## 10. 라이브러리

별도 a11y 라이브러리 추가 X (MVP). shadcn / Radix 가 처리.

출시 후 추가 후보:
```json
{
  "@axe-core/react": "^x.x",       // dev 환경에서 자동 a11y 검출
  "storybook-addon-a11y": "^x.x"   // Storybook 도입 시
}
```

---

## 보류 / TODO

- [ ] **디자인 토큰 명도 대비 검증** — 디자인 팀원 토큰 받을 때 WCAG AA 통과 확인
- [ ] **`axe-core` 도입 시점** — 출시 직전 자동 검출 도구로 잡힌 이슈 정리
- [ ] **스크린 리더 실 테스트** — 출시 전 핵심 흐름 (로그인 / 결제 / 주문) 만 NVDA 또는 VoiceOver 로 검증
- [ ] **모션 줄이기** (`prefers-reduced-motion`) — 출시 후 검토
- [ ] **포커스 복귀 정책 (라우트 이동 시)** — 출시 후 검토

---

## 변경 이력
- 2026-05-29: 초안 작성.
