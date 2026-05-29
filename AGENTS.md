# AGENTS.md

마감픽 프론트 작업 시 AI coding agent 가 따라야 할 공통 규칙.

---

## 프로젝트 단계

**졸업 프로젝트 / 출시 전.** 자세한 비즈니스 / 정책은 노션 기능 명세 페이지 (`../magampick_docs` 에서 작성 후 게시) 참조.

**클라이언트 3개 (모노레포)**:

| 디렉터리 | 종류 | 푸시 알림 | 위치 |
|---|---|---|---|
| `apps/customer` | PWA | FCM | Geolocation |
| `apps/seller` | PWA | FCM | Geolocation (선택) |
| `apps/admin` | 일반 Web | 미사용 | 미사용 |

**확정 도구**:
- **언어 / 빌드**: React + TypeScript + Vite + pnpm (workspaces)
- **라우팅**: React Router (v7)
- **UI / 스타일**: Tailwind CSS + shadcn/ui
- **데이터**: TanStack Query (서버 상태) + Zustand (전역 상태) + axios (HTTP) + Zod (검증)
- **폼**: react-hook-form + Zod + shadcn `<Form>`
- **테스트**: Vitest + RTL + Playwright
- **품질**: ESLint + Prettier
- **PWA**: vite-plugin-pwa (customer / seller 만)

> **Zod 가 일관 검증 도구**: 라우터 검색 파라미터 / 폼 검증 / API 응답 스키마 / 환경 변수 등 모든 런타임 검증을 Zod 로 통일.

---

## 작업 규칙

### 의사결정
- 명세에 없는 결정 (정책 / 컨벤션 / 구조) 은 **임의로 가정하지 않고** 사용자에게 묻거나 옵션을 제시
- 합리적 기본값이 있어도 doc / 코드에 반영하기 **전에** 확인 받기
- "권장 / 추천 / 일반적" 같은 표현은 옵션 제시 단계까지만. **적용 단계에선 사용자 확정 필요**

### 도메인 이해
- **노션 기능 명세 페이지** 가 단일 진실 소스 (정책 / scope / 화면 흐름 / API 의도 / 도메인 결정 / 서비스 개요)
- 작업 전 해당 페이지 fetch — 노션 MCP 사용 (`mcp__claude_ai_Notion__notion-fetch`)
- 페이지에 없는 결정 = 임의 가정 금지. 옵션 제시 → 사용자 결정 → 노션 본문 갱신 → 진행

### 언어
- 사용자와의 대화: **한국어**
- 코드 주석: 한국어 OK (의도 / 맥락 설명 시)
- 컴포넌트·함수·변수·파일명: **영문**
- 테스트 표현: 한국어 OK — `describe('상품 등록', () => { it('성공', ...) })` 형태. 구체 컨벤션은 테스트 도구 결정 시 [`docs/test-convention.md`](docs/test-convention.md) 에 정의

### 코드 작성
모든 항목 결정 대기 — 도구 / 라이브러리 결정 시 해당 docs 가 작성됨:

- 컴포넌트 / 폴더 / 훅 / 네이밍: [`docs/coding-convention.md`](docs/coding-convention.md)
- 라우팅 / 코드 스플리팅 / 타입 안전 룰 (React Router v7): [`docs/routing-convention.md`](docs/routing-convention.md)
- 서버 상태 (TanStack Query) / 클라이언트 상태 (Zustand): [`docs/state-convention.md`](docs/state-convention.md)
- 스타일링 (Tailwind CSS) / 디자인 토큰 / shadcn 컴포넌트 / 통일감 강제 룰: [`docs/styling-convention.md`](docs/styling-convention.md)
- API 호출 / 응답 / 에러 / 타입: [`docs/api-client-convention.md`](docs/api-client-convention.md)
- 폼 (react-hook-form + Zod + shadcn `<Form>`): [`docs/form-convention.md`](docs/form-convention.md)
- 인증 / 인가 (토큰 저장 / 자동 갱신 / Route Guard): [`docs/auth.md`](docs/auth.md)
- PWA (Service Worker / Manifest / FCM) — customer / seller 만: [`docs/pwa-convention.md`](docs/pwa-convention.md)
- 접근성: [`docs/accessibility.md`](docs/accessibility.md)

### 결정 / 구현 책임 분리
- **노션 기능 명세 페이지** = 정책 / scope / 화면 흐름 / 도메인 결정의 single source. 사용자가 `magampick_docs` 에서 작성 후 노션에 게시. `/impl` 의 plan mode 중 발견한 결정은 노션 본문에 갱신 (휘발 X — 다른 세션 / 모델도 같은 페이지 보고 동일하게 해석)
- **plan mode (in-session)** = 노션 본문 + convention 위에서 사용자와 합의하는 휘발 결정. 영향도 큰 결정은 옵션 제시 후 노션 반영
- **convention 문서** = mechanical detail 의 single source (폴더 구조 / 네이밍 / API 호출 패턴 / 컴포넌트 분리 기준 / 테스트 케이스 / 라우팅 형식 등 — 결정 후 해당 docs 에 단일 정의)
- `/impl` 은 노션 페이지 + plan 합의 + convention 을 본다. 셋 다 침묵하는 결정만 사용자에게 질문

### 테스트
- **TDD red→green 으로 작성**: 테스트 코드 먼저 → 실행해서 빨갛게 떨어지는 거 확인 → 구현 → 다시 실행해서 통과
- **도구**: **Vitest** (단위 — 순수 함수 / 훅 / 유틸) + **Vitest + RTL** (컴포넌트 렌더링 / 인터랙션) + **Playwright** (E2E — 핵심 사용자 흐름만)
- **VRT (Visual Regression)**: 도입 안 함. 출시 후 디자인 회귀 추적 필요해지면 Storybook + Chromatic 또는 Playwright screenshot 추가
- 적용 범위 / 강도 / 핵심 흐름 정의 / 파일 위치 / 모킹 (MSW 등) / 커버리지: [`docs/test-convention.md`](docs/test-convention.md) — **결정 대기**

### Git
- 커밋 메시지: [`docs/commit-convention.md`](docs/commit-convention.md) — `<emoji> <type>: <subject>` 한 줄만. **body / footer 사용 안 함** (백엔드와 동일 룰, 복사본)
- 브랜치·PR·머지·CI: [`docs/git-workflow.md`](docs/git-workflow.md) — **결정 대기** (백엔드 패턴 기반, 프론트 디테일로 작성 예정)
- **커밋 전 메시지 검토 필수** — `git commit` 실행 **전에** 작성한 커밋 메시지 전문과 해당 커밋에 포함될 파일 목록을 사용자에게 보여주고 확인받는다. 검토 없이 임의로 메시지를 작성해 커밋 / 푸시 금지. 여러 커밋이면 각각 보여줄 것
- **commit-msg hook 1회 셋업** — clone 후 메인 디렉터리에서 한 번: `git config core.hooksPath .githooks`. 모든 worktree 가 같은 `.git/config` 를 공유하므로 슬롯에서 다시 할 필요 없음. body 가 들어간 커밋을 자동 reject

---

## 워크플로우

작업은 **3단계** (명세 → 구현 → 머지). 모든 type 동일:

| 단계 | 명령 / 도구 | 산출물 | 사용자 검토 |
|---|---|---|---|
| 1. 명세 | `magampick_docs` 에서 본문 초안 → 노션 게시 (프론트 레포 작업 아님) | 노션 페이지 — 정책 / 화면 흐름 / 컴포넌트 분리 / API 호출 / 도메인 결정 | 노션에서 직접 |
| 2. 구현 | `/impl <노션URL>` (모드 A: 메인 → plan + 슬롯 attach, 모드 B: 슬롯 → TDD 구현 + 빌드) | plan 합의 → 노션 상태 갱신 → 코드 / 테스트 (TDD red→green) → 빌드 통과 | plan 합의 전 |
| 3. 머지 | `/impl` 끝에서 이어 진행 | 커밋 → 푸시 → PR (본문에 노션 URL 명시) → CI watch → CI green 시 자동 머지 → 슬롯 정리 → develop pull → 노션 상태 갱신 | 커밋 메시지 전, PR 본문 전 |

> **GitHub Issue 사용 안 함**: 노션이 이슈를 대체. 추적은 PR + 노션 본문 체크리스트.
>
> **`main` / `develop` 으로 직접 push 금지.** 항상 작업 브랜치 (`{type}/{슬러그}[-step{N}]`) → PR (`base: develop`) → 머지. 예외 없음.
>
> **3단계 = 머지까지 같은 세션에서 끝.** `/impl` 의 빌드 통과 후 사용자가 커밋 메시지 + PR 본문을 OK 하면, 그 시점에 머지까지 위임된다. CI green = 머지 게이트. 세션은 `gh pr checks --watch` 로 CI 결과를 기다리다가 green 즉시 머지 → 슬롯 정리 → develop pull → 노션 상태 갱신 → 사이클 완료 보고. CI red 면 원인 보고 후 다음 액션은 사용자와 결정.
>
> **작업 브랜치는 `/impl` 모드 A 에서 슬롯에 attach** — 노션 페이지 제목 → kebab-case 슬러그 → 빈 슬롯 (`magampick-fe-wt1/wt2/wt3` 중 detached HEAD 인 곳) 에 `git -C ../magampick-fe-wtX switch -c {type}/{슬러그}[-step{N}] origin/develop` 으로 attach. 이후 모드 B (`/impl <노션URL>` 슬롯에서 재호출 또는 `EnterWorktree` 진입) 는 **그 슬롯 디렉터리에서** 실행한다. 시작 시 슬롯 위치인지 확인하고 메인 디렉터리 (`develop`/`main`) 이면 모드 A 부트스트랩으로 분기.

### 단계별 docs 수정 범위

**`feat` / `fix` 워크플로우 기준** — `refactor` / `docs` / `chore` 는 작업 scope 안에서 자유롭게 수정:

| 단계 | 수정 OK | 수정 X (별도 작업) |
|---|---|---|
| 명세 (노션) | 노션 페이지 본문 (정책 / 화면 흐름 / 결정) — 프론트 레포 변경 없음 | 프론트 레포의 docs / 코드 |
| `/impl` | `auth.md` (인증·인가 정책) / 해당 기능에 묶인 컨벤션 미정 사항 | coding / routing / state / styling / api-client / test / pwa / accessibility / commit / git-workflow convention 들 |

> 한 노션 페이지 = 1+ PR (쪼갠 경우 본문 체크리스트로 단계 추적). 컨벤션 수정 같이 가면 PR 비대 → 별도 chore 로 분리.

### plan / 구현 중 미정 발견 시
`/impl` 의 plan mode 또는 구현 중 정책 / scope 미정 발견 → **옵션 제시 → 사용자 결정 → 노션 페이지 본문 갱신** (휘발 X) → 진행. 임의 가정 금지.

### 병렬 운영

#### Worktree 슬롯 풀

같은 디렉터리에서 두 세션이 `.git` 을 공유하면 한쪽의 checkout 이 다른 세션 브랜치를 바꾼다. 그리고 Windows + Claude / IDE 환경에선 작업마다 worktree 를 생성·제거하면 OS 디렉터리 lock 으로 정리가 막힌다. → 미리 만들어둔 슬롯 풀을 작업마다 갈아끼우는 방식을 쓴다.

**구조 — 메인 + 작업 슬롯 3개 (fungible)**:

```
magampick-fe          # 메인 디렉터리. develop 고정 — pull / `/impl` 모드 A / 슬롯 정리의 홈베이스
magampick-fe-wt1      # 작업 슬롯 1
magampick-fe-wt2      # 작업 슬롯 2
magampick-fe-wt3      # 작업 슬롯 3
```

슬롯은 type / 앱 구분 없이 **fungible** — `feat/`, `fix/`, `refactor/`, `chore/` 어느 브랜치든, `customer` / `seller` / `admin` 어느 앱이든 빈 슬롯에 임의로 attach.

**최초 1회 셋업** (GitHub origin push + `develop` 브랜치 생성 후, 각 머신 / 환경마다):
```sh
git worktree add ../magampick-fe-wt1 --detach origin/develop
git worktree add ../magampick-fe-wt2 --detach origin/develop
git worktree add ../magampick-fe-wt3 --detach origin/develop
```

`--detach` 로 만들어 어느 브랜치도 점유하지 않는 **빈 슬롯** 상태로 둔다.

**규칙**:

- **메인 디렉터리 `magampick-fe` 는 항상 `develop` 고정** — pull / `/impl` 모드 A (노션 fetch + plan + 슬롯 attach) / 슬롯 정리 / PR 웹 리뷰의 홈베이스. 여기서 작업 브랜치로 checkout 하지 않는다.
- **모든 작업 브랜치는 슬롯에서** — impl 뿐 아니라 문서 / 컨벤션 수정도 예외 없이 (docs / chore 도 슬롯 사용).
- **슬롯 attach = `/impl` 모드 A 끝에서 1회** — 노션 페이지 제목 → kebab-case 슬러그 → 빈 슬롯에 `git -C ../magampick-fe-wtX switch -c {type}/{슬러그}[-step{N}] origin/develop`. 빈 슬롯은 `git worktree list` 에서 `(detached HEAD)` 표시. (노션 페이지 없는 chore / docs 는 사용자가 직접 슬롯 attach 또는 사용자 지시에 따라.)
- **`/impl` 모드 B 는 그 슬롯 디렉터리에서 에이전트를 띄워 실행한다.** 도구 앵커 (파일 탐색·셸 cwd·스킬) 가 그 디렉터리 기준이어야 함. Claude Code 한정으로 `EnterWorktree` 로 같은 세션에서 슬롯 진입 가능 (Codex 엔 없음 — relaunch 필요).
- **빈 슬롯 표시 = detached HEAD on `origin/develop`**. 한 슬롯은 attach 된 동안 한 브랜치만 점유 (git 제약). `develop` 은 메인이 점유 중이라 슬롯에서 `switch develop` 은 실패 — 항상 `--detach origin/develop` 사용.
- **PR 머지 후 정리** — 슬롯 안의 브랜치 떼기 + 로컬·원격 브랜치 삭제. **`git worktree remove` 호출 X** (OS lock 회피):
  ```sh
  git -C ../magampick-fe-wtX switch --detach origin/develop  # 슬롯을 빈 상태로
  git branch -D {type}/{슬러그}[-step{N}]                    # 로컬 브랜치 삭제
  # 원격 브랜치는 PR auto-delete 됐으면 생략, 아니면 git push origin --delete {branch}
  ```
- **PR 리뷰** — 가벼운 리뷰는 메인 디렉터리에서 GitHub 웹 / IDE diff 로. 무거운 리뷰가 필요하면 빈 슬롯에 `gh pr checkout {N}` 으로 잠깐 attach 후 다시 detach.
- **임시 슬롯 추가** — 슬롯 3개 다 점유 중인데 핫픽스가 필요하면 `magampick-fe-wt4` 같이 임시 추가 OK. 작업 후 detach 로 비우거나 `git worktree remove` 로 완전 제거. 일반 운영엔 3개로 충분.
- `node_modules` / `dist` / pnpm store 는 슬롯별로 독립 — 격리에 유리. 슬롯 재사용 시 IDE 인덱싱 / Vite 캐시가 그대로 재활용된다.

#### 그 외

- 동시 구현 작업은 1~2개 정도로 제한 (슬롯 3개 중 1개는 docs / 리뷰 / 핫픽스 여유). 3개 이상 동시 impl 은 머지 충돌 / 컨텍스트 부담이 커진다.
- **의존성 있는 작업은 동시 진행 X** — 공유 패키지 (`packages/*`) 변경 + 그 패키지를 쓰는 앱 작업, 또는 한 앱의 라우터·전역 상태 등 영향 큰 변경 + 같은 앱의 다른 작업.
- **dev 서버 포트**: 슬롯마다 다른 포트 사용 (예: 5173 / 5174 / 5175 — 정확한 룰은 도구 결정 후 `docs/coding-convention.md` 에 명시).

### AI Agent 호환성

- 공통 프로젝트 규칙은 `AGENTS.md` 를 단일 원본으로 둔다.
- Claude Code 호환 파일은 `CLAUDE.md` 와 `.claude/skills/` 를 사용한다.
- Codex 워크플로우 원본은 `.codex/skills/magampick-workflow/` 를 사용한다 — **결정 대기** (백엔드 패턴 따라 작성 예정).
- `/impl` 절차를 바꿀 때는 `.claude/skills/` 와 (있다면) `.codex/skills/magampick-workflow/` 가 서로 어긋나지 않게 함께 갱신한다.

---

## 자주 쓰는 명령

| 용도 | 명령 |
|---|---|
| 의존성 설치 | `pnpm install` |
| dev 서버 / 빌드 / 테스트 / 린트 / 포맷 | **결정 대기** (도구 결정 후 pnpm 스크립트 정의) |

---

## 참고 문서

| 문서 | 내용 | 상태 |
|---|---|---|
| **외부 — 노션** | 기능 명세 / 정책 / 결정 / 화면 흐름 / 서비스 개요 (single source) | live |
| [`docs/commit-convention.md`](docs/commit-convention.md) | 커밋 메시지 규칙 (백엔드와 동일 룰, 복사본) | 예정 (복사) |
| [`docs/git-workflow.md`](docs/git-workflow.md) | 브랜치 / PR / 머지 / CI | 예정 |
| [`docs/coding-convention.md`](docs/coding-convention.md) | 모노레포 / Feature-based / 네이밍 / 콜로케이션 / 절대경로 / dev 포트 | ✅ 완료 |
| [`docs/routing-convention.md`](docs/routing-convention.md) | createBrowserRouter / ROUTES 상수 / Zod params 검증 / Wrapper 가드 / lazy / Nested Layout / Loader 제한 사용 | ✅ 완료 |
| [`docs/state-convention.md`](docs/state-convention.md) | 4영역 분리 (서버/전역/URL/로컬) / QueryClient 설정 / queryKey / 무효화 / Zustand 스토어 / persist 정책 | ✅ 완료 |
| [`docs/styling-convention.md`](docs/styling-convention.md) | Tailwind + shadcn 셋업 / 공유 토큰 (root) / cn() / 토큰 외 값 금지 / mobile-first / Pretendard / lucide-react | ✅ 완료 |
| [`docs/api-client-convention.md`](docs/api-client-convention.md) | axios 인스턴스 (`withCredentials`) / interceptor (Bearer access + cookie refresh) / 에러 정규화 / Zod 응답 검증 | ✅ 완료 |
| [`docs/form-convention.md`](docs/form-convention.md) | 4부품 (Zod + useForm + shadcn `<Form>` + mutation) / 검증 모드 / useFieldArray / 의존 필드 / 파일 업로드 / 안티 패턴 | ✅ 완료 |
| [`docs/auth.md`](docs/auth.md) | 듀얼 JWT (메모리 access + HttpOnly cookie refresh) / silent refresh / role 가드 / Mock 휴대폰 인증 | ✅ 완료 |
| [`docs/test-convention.md`](docs/test-convention.md) | Vitest (jsdom) + RTL + Playwright + MSW / TDD red→green / 콜로케이션 / 한국어 표현 / 핵심 E2E 흐름 | ✅ 완료 |
| [`docs/pwa-convention.md`](docs/pwa-convention.md) | vite-plugin-pwa + Workbox 캐싱 / Manifest / FCM / 설치 prompt / Geolocation / 앱별 차이 (customer/seller 만) | ✅ 완료 |
| [`docs/accessibility.md`](docs/accessibility.md) | MVP 5룰 (시맨틱 / 키보드 / alt / 폼라벨 / 명도 대비) / shadcn 자동 처리 / 출시 후 보강 | ✅ 완료 |

> 새 문서가 추가되면 이 표에 한 줄로 등록. 도구 결정될 때 해당 docs 가 작성됨.
