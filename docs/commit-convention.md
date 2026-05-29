# Git 커밋 컨벤션

> 백엔드 (`magampick-api`) 와 동일 룰. 예시만 프론트 컨텍스트로 조정.

## 1. 베이스

- **Conventional Commits** 기반
- **Gitmoji** 공식 매핑으로 이모지 적용
- 표현력을 위해 일부 커스텀 타입 추가
  (`ui`, `init`, `release`, `rename`, `remove`, `merge`, `security`, `i18n`)

---

## 2. 형식

`<emoji> <type>: <subject>`

- **type** — 영문 소문자로 작성
- **subject** — 한글로 작성
- **scope** — 사용 안 함
- **body** — 사용 안 함
- **footer** — 사용 안 함

예: `✨ feat: 상품 목록 페이지 추가`

---

## 3. 타입 & 이모지 (Type & Emoji)

| 이모지 | 타입 | 의미 | 예시 |
| --- | --- | --- | --- |
| ✨ | `feat` | 새 기능 / 컴포넌트 / 페이지 추가 | `✨ feat: 상품 목록 페이지 추가` |
| 🐛 | `fix` | 버그 수정 | `🐛 fix: 결제 버튼 클릭 시 중복 호출 수정` |
| 📝 | `docs` | 문서/주석 수정 | `📝 docs: routing-convention 에 가드 패턴 추가` |
| 💄 | `ui` | UI/스타일 시각적 조정 | `💄 ui: 카드 여백 디자인 토큰에 맞춰 조정` |
| 🎨 | `style` | 코드 포맷팅 (동작 변경 없음) | `🎨 style: ESLint 자동 수정 적용` |
| ♻️ | `refactor` | 리팩토링 (기능 변화 없음) | `♻️ refactor: 상품 카드 컴포넌트 분리` |
| ✅ | `test` | 테스트 코드 추가/수정 | `✅ test: useAuth 훅 단위 테스트 추가` |
| 🔧 | `chore` | 설정 파일 등 기타 변경 | `🔧 chore: ESLint 규칙 조정` |
| ⚡️ | `perf` | 성능 개선 | `⚡️ perf: 상품 목록 가상 스크롤 적용` |
| 🔒️ | `security` | 보안 이슈 수정/개선 | `🔒️ security: XSS 취약점 패치` |
| 🌐 | `i18n` | 다국어/국제화 작업 | `🌐 i18n: 에러 메시지 영어 번역 추가` |
| 👷 | `ci` | CI 설정 변경 | `👷 ci: GitHub Actions 워크플로 추가` |
| 📦️ | `build` | 빌드 시스템/의존성 변경 | `📦️ build: React 19 로 업데이트` |
| ⏪️ | `revert` | 이전 커밋 되돌리기 | `⏪️ revert: 상품 목록 페이지 추가 되돌림` |
| 🎉 | `init` | 프로젝트 초기 셋업 | `🎉 init: 모노레포 초기 셋업` |
| 🏷️ | `release` | 버전 태그 / 릴리스 | `🏷️ release: v1.2.0 버전 업데이트` |
| 🚚 | `rename` | 파일/폴더명 변경 또는 이동만 수행 | `🚚 rename: components 를 features 로 이동` |
| 🔥 | `remove` | 파일/코드 삭제만 수행 | `🔥 remove: 사용하지 않는 legacy 페이지 삭제` |
| 🔀 | `merge` | 브랜치 병합 (수동 작성 시) | `🔀 merge: develop 브랜치를 main 에 병합` |

---

## 4. 제목(Subject) 작성 규칙

- 50자 이내
- 명사형으로 종결 (예: `상품 목록 페이지 추가`)
- 마침표 ❌
- 불필요한 조사 생략 (`페이지를 추가` ❌ → `페이지 추가` ✅)
- 능동형 사용 (`추가됨` ❌ → `추가` ✅)

---

## 5. FAQ / 헷갈리는 케이스

### `feat` vs `ui`

- 새로운 UI 컴포넌트/페이지/요소 **추가** → `feat`
- 기존 UI의 시각적 **조정** (색상, 간격, 폰트, 레이아웃 미세 조정) → `ui`

### `ui` (💄) vs `style` (🎨)

- 💄 `ui` — 사용자에게 보이는 UI 변경
- 🎨 `style` — 코드 포맷팅 (들여쓰기, 세미콜론 등 동작과 무관 — ESLint / Prettier 자동 수정)

### `docs` (📝)

- 문서뿐 아니라 **주석**도 포함

### `refactor` vs `rename` vs `remove`

- 파일 이동/이름 변경**만** → `rename`
- 파일/코드 삭제**만** → `remove`
- 내부 로직 개선 (이동/삭제 동반 가능) → `refactor`
- 핵심: **`rename`/`remove`는 "그것만" 한 경우**, 다른 변경이 섞이면 해당 타입 우선

### `build` vs `chore` vs `ci`

- 의존성 추가/업데이트, Vite / pnpm 변경 → `build` (📦️)
- ESLint/Prettier 설정 파일 → `chore` (🔧)
- GitHub Actions 등 CI 환경 → `ci` (👷)

### `release` (🏷️)

- **버전 태그 시점**에만 사용 (`package.json` 버전 업데이트, CHANGELOG 작성 등)
- 환경 배포(dev/staging/production)는 보통 자동화로 처리되므로 별도 커밋 안 만듦
- 환경 배포 기록이 필요하면 subject에 명시 (예: `🏷️ release: v1.2.0 → production 배포`)

### `merge` (🔀)

- Git이 자동 생성하는 merge 커밋은 컨벤션 강제 ❌
- **수동으로 merge 메시지를 작성할 때만** 적용
