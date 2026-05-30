---
name: impl
description: 노션 기능 명세 페이지 → plan mode 합의 → TDD red→green 구현 → 빌드 → PR 머지 → 노션 상태 갱신. /impl <노션URL> 로 호출. 노션 페이지 (정책 / scope / 도메인 결정) + plan 합의 + convention (mechanical) 이 source. 셋 다 침묵할 때만 사용자에게 질문. 쪼갠 경우 노션 본문 체크리스트로 단계 추적. 메인 디렉터리에서 호출 시 plan 까지 진행 후 슬롯 attach + 안내 (부트스트랩 모드), 슬롯에서 호출 시 코드 작업부터 진행 (실행 모드). 외부 모델 리뷰 사용 안 함.
---

# /impl — 구현 (프론트)

마감픽 프론트 워크플로우. **노션 기능 명세 페이지** 를 single source 로 받아 → plan mode → TDD → 구현 → PR 머지 → 노션 상태 갱신.

> 노션 페이지 = 정책 / scope / 화면 흐름 / API 의도 / 도메인 결정. plan 합의 = in-session 휘발 결정. convention = mechanical 표준 (폴더 구조 / 네이밍 / API 호출 패턴 / 테스트 케이스 등). 셋 다 침묵할 때만 사용자에게 질문.
>
> **이슈 시스템 사용 안 함**: GitHub Issue 는 만들지 않는다. 명세 = 노션. 추적 = PR + 노션 페이지 본문 체크리스트.
>
> **외부 모델 리뷰 사용 안 함**: 빌드 통과 후 바로 커밋 / PR / CI green 시 머지.

## 입력

- `<노션URL>` — 노션 "기능 명세 (Features)" DB 의 페이지 URL (필수, 예: `/impl https://www.notion.so/...`)

## 두 가지 호출 모드

`/impl` 은 호출 위치에 따라 모드가 다르다:

| 모드 | 호출 위치 | 처리 단계 |
|---|---|---|
| **A. 부트스트랩** | 메인 디렉터리 (`develop` / `main`) | §1 노션 fetch → §2 plan 합의 → §3 노션 "기획"→"개발중" → §4 슬롯 attach → 사용자 안내 + 중단 |
| **B. 실행** | 슬롯 (`feat/<slug>` 등) | §1 노션 fetch (재확인) → §5 TDD 구현 → §6 빌드 → §7 머지 → §8 노션 상태 갱신 |

판별: `git branch --show-current` / `git worktree list`.

> **Claude Code 한정 편의**: 모드 A 의 §4 끝에서 `EnterWorktree` 로 슬롯 진입 후 모드 B 를 같은 세션에서 이어서 진행 (relaunch 없이 1회 호출로 끝). Codex 엔 없으니 canonical 절차는 두 단계 호출.

---

## §1. 노션 페이지 fetch

```text
mcp__claude_ai_Notion__notion-fetch(id=<노션URL>)
```

읽어야 할 속성:
- `기능명` (title) / `분류` / `사용자` / `상태` / `설명`
- 본문 (Markdown content) — 화면 흐름 / 컴포넌트 분리 / API 호출 / 검증 / 권한
- 릴레이션: `관련 정책`, `관련 결정` (있으면 JSON array of URLs)

**릴레이션 펼침 규칙**:
- 본문 + `설명` 만으로 정책 / scope / 화면 흐름이 충분히 명확 → 릴레이션 fetch skip
- 부족하면 `관련 정책` / `관련 결정` 각 URL 을 별도 `notion-fetch` 호출로 펼침
- `관련 외부연동` 은 본문에서 명시적으로 언급될 때만 펼침 (예: 토스페이 / 카카오맵 / FCM)

**적용 앱 결정** — 노션 페이지가 어느 앱(s) 에 적용되는지:
- `사용자` 속성에 따라: `소비자` → `apps/customer`, `사장` → `apps/seller`, `관리자` → `apps/admin`
- 공통 컴포넌트 / API 클라이언트 / 디자인 토큰은 `packages/*` 후보 — plan 에서 확인

**Type 결정** — 노션 페이지의 의도에 따라:
- 신규 화면 / 컴포넌트 / 기능 → `feat`
- 버그 수정 → `fix`
- 코드 구조 / 가독성 / 성능 (사용자 인지 변화 없음) → `refactor`
- UI 시각 조정 (색 / 간격 / 폰트) → `ui`

> `docs` / `chore` 는 노션 명세 DB 와 무관 — 노션 URL 없이 사용자가 직접 지시. 이 SKILL 의 노션 흐름은 거의 `feat` / `fix` / `ui` / `refactor`.

---

## §2. plan mode 진입 + 합의 (모드 A 에서만)

> 첫 코드 / 파일 편집 **전** 에 plan mode 진입. Claude Code: native plan mode (shift+tab). Codex: 구조화된 plan 을 chat 으로 출력 후 명시적 사용자 승인 대기.

**plan 에 포함**:

1. **노션 페이지 요약** — 기능명 / 분류 / 사용자 / 현재 상태 / 본문 핵심
2. **적용 앱 / 공유 패키지 결정** — `apps/customer|seller|admin` 중 어느 것 + `packages/*` 영향 여부
3. **충분함 체크** — 정책 / scope / 화면 흐름 / API 의도가 노션 본문 + 릴레이션에 명시되어 있나?
   - 빈 곳 / 모호한 부분 발견 → **옵션으로 사용자에게 질문** → 사용자 결정 → **노션 페이지 본문 갱신** (`notion-update-page` 의 `update_content` 또는 `insert_content`) → 휘발 X
   - 결정이 노션에 박혀야 향후 다른 세션 / 모델이 같은 페이지를 봐도 동일하게 해석
4. **영향도 높은 결정** (본문에 명시 안 된 부분만 옵션으로):
   - 라우트 구조 (보호 라우트 / 인증 가드)
   - 다중성 / 카디널리티 (단일 vs 다중 선택, 페이지네이션 vs 무한 스크롤)
   - 권한 분기 (role 별 화면 / 버튼 노출)
   - 폼 검증 규칙 / 에러 메시지
   - 캐시 무효화 정책 (어느 query key 들을 invalidate 할지)
   - PWA 영향 (Service Worker 캐싱 전략 / 오프라인 처리)
   - 디자인 토큰 추가 필요성 (새 색 / 간격)
5. **쪼개기 합의** — 한 PR 로 갈지, 여러 PR 로 단계 분할할지 사용자와 결정
   - 한 PR: 그대로 진행
   - 여러 PR: **노션 페이지 본문에 단계 체크리스트 작성** (예: `- [ ] Step 1: API 클라이언트 + 훅`, `- [ ] Step 2: 컴포넌트 + 페이지`, ...). 이번 `/impl` 호출은 **첫 단계만** 진행
6. **적용 단계 합의** — Type 분기 표 기준으로 어디부터 어디까지

**합의 룰**:
- 노션 / convention 셋 다 침묵하는 결정만 사용자에게 질문
- 노션 본문에 이미 박힌 결정은 plan 에 중복 검토 X
- plan 합의 = "이렇게 진행" 동의. plan exit 후 §3 → §4

### Type 분기 (적용 단계 결정)

| Step | feat / fix | refactor | ui |
|---|---|---|---|
| §5 TDD 구현 (타입 ~ 컴포넌트 + 테스트) | 전체 | 해당 layer 만 | 컴포넌트만 (스타일 조정) |
| §5-6 E2E (핵심 흐름) | 가입 / 로그인 / 결제 / 픽업 완료 시 | 해당 시 | 보통 skip |
| §5-7 lint + format | ✓ | ✓ | ✓ |
| §5-8 build + test | ✓ | ✓ | ✓ |
| §7 머지 + 노션 상태 갱신 | ✓ | ✓ | ✓ |

---

## §3. 노션 상태 "기획" → "개발중" (모드 A)

```text
mcp__claude_ai_Notion__notion-update-page(
  page_id=<페이지ID>,
  command="update_properties",
  properties={ "상태": "개발중" }
)
```

쪼갠 경우 첫 단계 시작 시점에 한 번만 변경. 이후 PR 들은 본문 체크리스트만 업데이트.

---

## §4. 슬롯 attach (모드 A)

**슬러그 추출**:
1. 노션 페이지 `기능명` (title) 에서 한국어 기능명 추출
2. 영문 kebab-case 로 변환 (예: `상품 목록 화면` → `product-list`)
3. 영문 변환이 모호한 용어는 사용자에게 옵션 제시 + 확정 (glossary 미사용)

쪼갠 경우: 슬러그 뒤에 `-step{N}` 접미 (예: `product-list-step1`).

**빈 슬롯 찾기**:
```powershell
git worktree list
```
`(detached HEAD)` 표시된 슬롯이 빈 슬롯. 기본 풀: `magampick-fe-wt1/wt2/wt3` ([AGENTS.md §"병렬 운영"](../../../AGENTS.md)). 모두 점유 시 사용자에게 정리 / 임시 슬롯 추가 여부 확인 후 중단.

**브랜치 생성 + 슬롯 attach**:
```powershell
git -C ../magampick-fe-wtX switch -c feat/<slug> origin/develop
```
- type 이 feat 가 아니면 prefix 조정 (`fix/`, `refactor/`, `ui/`)
- origin push 는 첫 커밋 후 `git push -u origin feat/<slug>` 로 (§7 의 커밋 사이클에서 처리)

**결과 보고 + 중단**:
> ✅ 슬롯 attach: `../magampick-fe-wtX` (브랜치: `feat/<slug>`)
> 노션 상태: 기획 → 개발중
> 다음 단계: 그 디렉터리에서 에이전트 띄워 `/impl <노션URL>` 재실행 (모드 B 진입)
>
> Claude Code 한정: `EnterWorktree` 로 슬롯 진입 후 이어서 진행 가능 (relaunch 대체)

---

## §5. TDD red → green 구현 (모드 B)

> **핵심 원칙**: 테스트 코드 작성 → 실행해서 빨갛게 떨어지는 거 확인 (red) → 구현 코드 → 다시 실행해서 통과 확인 (green). layer 마다 사이클 반복.
>
> **layer 별 구체 폴더 / 파일 위치 / 네이밍**: [`coding-convention.md`](../../../docs/coding-convention.md) 참조 (결정 대기 — 결정 후 채움).

### 5-1. 타입 / Zod 스키마 (TDD 불가 — 시그니처)

작성 후 `pnpm typecheck` (또는 `tsc --noEmit`) 통과 확인.

- **타입**: API 응답 / 도메인 모델 / 컴포넌트 props 타입 정의
- **Zod 스키마**: API 응답 검증 / 폼 검증 / 검색 파라미터 검증 (single source — 라우터 / 폼 / API 다 동일 Zod 스키마 사용)
- 위치 / 네이밍 = [`coding-convention.md`](../../../docs/coding-convention.md) (예정)

### 5-2. API 클라이언트 함수 (axios + Zod)

- axios 인스턴스 + interceptor (토큰 / 401 refresh / 에러 정규화) = [`api-client-convention.md`](../../../docs/api-client-convention.md) (예정)
- 각 엔드포인트 함수 = axios 호출 + Zod 응답 검증
- **단위 테스트** (TDD red→green): axios mock + 응답 검증 통과 / 실패 케이스. MSW 도입 시 핸들러 작성

### 5-3. 훅 (useQuery / useMutation / Zustand)

**1. 테스트 코드 먼저**: 노션 본문의 화면 흐름 + plan 합의에서 표준 케이스 도출
- TanStack Query 훅: 캐시 키 / refetch / mutation 후 invalidate
- Zustand 훅: 액션 호출 → 상태 변화
- `describe('useXXX', () => { it('상품_조회_성공', ...) })` 형태 — 한국어 표현

**2. 실행 → red**:
```powershell
pnpm test --run path/to/useXXX.test.ts
```

**3. 훅 구현**: TanStack Query / Zustand 사용 = [`state-convention.md`](../../../docs/state-convention.md) (예정)

**4. 재실행 → green**.

### 5-4. 컴포넌트 (RTL + user-event)

**1. 테스트 먼저**: 노션 본문의 화면 흐름에서 사용자 인터랙션 케이스 도출
- 렌더 / 조건부 노출 / 사용자 이벤트 (클릭 / 입력 / 제출) / 에러 상태
- `render()` + `screen.getByRole(...)` + `userEvent.click(...)` + `expect(...)`
- 훅 / API 는 mock (또는 MSW)

**2. 실행 → red**:
```powershell
pnpm test --run path/to/XXX.test.tsx
```

**3. 컴포넌트 구현**: shadcn 컴포넌트 + Tailwind 토큰 = [`styling-convention.md`](../../../docs/styling-convention.md) / [`coding-convention.md`](../../../docs/coding-convention.md) (예정)
- **프로토타입 정독 (UI 구현 전 필수)**: [`prototype-index.md`](../../../docs/prototype-index.md) 로 화면 소스 위치 찾기 → 해당 `scripts/NN.js`(구조·상태·검증 로직) + `styles/*.css`(정확한 px·radius·색)에서 **스펙 추출**. 눈대중 X — shadcn/라이브러리 기본값이 프로토타입과 다르면(예: `Input` 기본 높이) 오버라이드.
- 폼은 react-hook-form + Zod + shadcn `<Form>` 조합 = [`form-convention.md`](../../../docs/form-convention.md) (예정)
- 라우팅 / Link / Guard = [`routing-convention.md`](../../../docs/routing-convention.md) (예정)

**4. 재실행 → green**.

**5. 스크린샷 대조 (UI 화면 — 임시 검증)**: dev 서버를 **슬롯 포트**로 띄우고(`pnpm --filter <app> dev -- --port <슬롯포트> --strictPort` — wt1=`15173` / wt2=`25173` / wt3=`35173`, 충돌 시 +30000), Playwright(headless 393×852)로 단계·화면별 스크린샷 → 프로토타입과 대조 → 교정. 스크립트·스크린샷은 **커밋 전 삭제** (커밋 E2E §5-6 과 별개). 자세한 절차·포트 표 = [`prototype-index.md`](../../../docs/prototype-index.md) "구현 충실도".

### 5-5. 페이지 / 라우트 셸

컴포넌트 조합. 별도 단위 테스트 X (E2E 가 커버). React Router 라우트 정의 / loader / Guard 적용.

### 5-6. E2E (핵심 흐름인 경우만)

노션 본문의 화면 흐름이 **핵심 사용자 흐름** (가입 / 로그인 / 상품 검색 → 결제 / 픽업 완료) 이면 작성. 그 외 skip.

- 위치 / 셋업 = [`test-convention.md`](../../../docs/test-convention.md) (예정)
- Playwright: 실제 브라우저 (Chromium 우선) 띄워서 사용자처럼 클릭
- **목적**: mock 가정 어긋나는 부분 (실제 API 응답 형식 / 라우팅 / Service Worker / 인증 흐름) 드러냄. AI 자기참조 검증 위험 차단

TDD 순서 — E2E 먼저 → red → 위 layer 들 구현 마무리 → green.

### 5-7. lint + format

```powershell
pnpm lint --fix
pnpm format
```
(정확한 명령은 `package.json` 스크립트 정의 후 — 결정 대기.)

### 5-8. build + test (전체)

```powershell
pnpm build
pnpm test
```

빌드 / 전체 테스트 통과 확인. 실패 시:
- **단순 실패** (오타 / import / 타입 / 포맷) → 자동 수정 후 재실행 (1~2회)
- **복잡한 실패** (로직 / 노션 본문 해석) → 사용자에게 보고 + 결정 받기

---

## §6. (외부 모델 리뷰 — 사용 안 함)

프론트는 외부 모델 리뷰 단계를 두지 않는다. 빌드 통과 후 바로 §7 머지 사이클로.

---

## §7. 결과 보고 + 머지 사이클 + 노션 상태 갱신 (사용자 검토 ★)

빌드 통과 후 사용자에게 보고:

```markdown
## /impl 완료 — 노션 페이지: <기능명>

### 적용 앱
- apps/customer (또는 seller / admin / packages/*)

### 생성 / 수정 파일
- 타입 / Zod 스키마: ...
- API 클라이언트: ...
- 훅 (useQuery / Zustand): ...
- 컴포넌트 + 테스트: ...
- 페이지 / 라우트: ...
- E2E (해당 시): ...

### 빌드 결과
✅ pnpm build / pnpm test 통과

### plan + convention 밖 결정 (있는 경우만)
- {convention 따라 자동 적용된 mechanical detail 은 적지 않음}
```

보고 직후 머지까지 같은 세션에서 끝낸다 ([`AGENTS.md` 워크플로우](../../../AGENTS.md) / [`git-workflow.md §4`](../../../docs/git-workflow.md)):

1. **커밋 메시지 검토** — `<emoji> <type>: <subject>` **한 줄만** ([`commit-convention.md` §2](../../../docs/commit-convention.md) — body / footer 사용 안 함). 작성한 메시지 + 커밋 파일 목록 사용자에게 보여주고 OK 받기. `commit-msg` hook 우회 / `--no-verify` 금지
2. **커밋 + 푸시** — 첫 push 는 `git push -u origin feat/<slug>`
3. **PR 본문 검토** — `gh pr create` 호출 전 제목 / 본문 사용자에게 보여주고 OK 받기. **이 시점이 머지까지 위임받는 동의 시점**. PR 본문에 **노션 페이지 URL** 명시 (쪼갠 경우 `Step N/M` 표기)
4. **PR 생성** — `gh pr create --base develop ...`
5. **CI watch** — `gh pr checks {PR번호} --repo MagamPick/magampick-fe --watch` background. 다른 폴링 / sleep 금지
6. **자동 머지** — CI green 시 즉시 `gh pr merge {PR번호} --merge --delete-branch`. 사용자 추가 확인 없이 진행 (CI = 머지 게이트). `gh pr view ... --json state,mergedAt,mergeCommit` 으로 검증
7. **슬롯 정리 + develop pull**:
   ```sh
   git fetch --prune
   git switch --detach origin/develop          # 슬롯을 빈 상태로
   git branch -D feat/<slug>                    # 로컬 브랜치 삭제
   git -C "{메인 디렉터리 절대경로}" pull        # 메인 develop 최신화
   ```
8. **노션 상태 갱신**:
   - **한 PR 로 페이지 전체 완료** → `상태` "개발중" → "운영중"
     ```text
     mcp__claude_ai_Notion__notion-update-page(
       page_id=<페이지ID>,
       command="update_properties",
       properties={ "상태": "운영중" }
     )
     ```
   - **여러 PR 중 일부만 완료** → 본문 체크리스트의 해당 항목만 `[x]` 로 체크 (`update_content` 의 search-and-replace). `상태` 는 그대로 "개발중" 유지
9. **사이클 완료 보고** — PR URL / merge commit / 노션 상태 / 다음 단계 안내

CI red 인 경우: 실패 원인 + 다음 액션 후보 (수정 후 추가 커밋 vs 롤백 vs 상의) 보고 후 사용자 결정 대기. 임의 강제 머지 / 머지 시도 X.

---

## §8. (백엔드의 roadmap 갱신 단계 — 프론트는 사용 안 함)

프론트는 `docs/roadmap.md` 를 두지 않는다 (노션이 진행 상태 추적의 single source). §7 의 노션 상태 갱신으로 대체.

---

## 중간 질문 — 자연스럽게 (강제 검토 X)

다음 상황에서만 사용자에게 묻기 (대부분은 §2 plan 단계에서 이미 합의돼 있어야 정상):
- **노션 본문 + plan + convention 모두 침묵하는 결정 발견** — mechanical 이면 convention 에서 가져오고, 정책성이면 사용자에게 + **결정은 노션에 반영** (휘발 X)
- 빌드 / 테스트가 단순 수정으로 안 되는 실패
- 노션 본문 해석이 두 가지 이상 가능한 모호함
- `auth.md` 갱신 시 인증 정책 결정 필요 (예: 토큰 저장 위치 변경)

## 단계별 docs 수정 권한

**수정 OK** (구현 중):
- `docs/auth.md` (인증 / 인가 정책 결정 필요 시 — 노션 본문에도 반영)
- 해당 기능에 묶인 컨벤션 미정 사항 (예: 새로운 폼 패턴 첫 등장 시 form-convention 일부)

**수정 X (별도 chore PR)**:
- coding-convention / routing-convention / state-convention / styling-convention / api-client-convention / form-convention / test-convention / commit-convention / git-workflow / pwa-convention / accessibility

## convention single source 매핑

노션 / plan 침묵 시 convention 에서 가져온다 — 추측 X, 일관 적용:

| Topic | Source |
|---|---|
| 폴더 구조 / 네이밍 / 컴포넌트 분리 / dev 포트 | [`coding-convention.md`](../../../docs/coding-convention.md) (예정) |
| 라우트 정의 / 가드 / 코드 스플리팅 / 타입 안전 룰 | [`routing-convention.md`](../../../docs/routing-convention.md) (예정) |
| TanStack Query 키 / 캐시 무효화 / Zustand 스토어 분리 | [`state-convention.md`](../../../docs/state-convention.md) (예정) |
| Tailwind 토큰 / shadcn 사용 / 통일감 강제 | [`styling-convention.md`](../../../docs/styling-convention.md) (예정) |
| axios interceptor / 에러 정규화 / Zod 응답 검증 | [`api-client-convention.md`](../../../docs/api-client-convention.md) (예정) |
| react-hook-form 패턴 / Zod 스키마 / shadcn `<Form>` | [`form-convention.md`](../../../docs/form-convention.md) (예정) |
| 테스트 강도 / 핵심 흐름 / 파일 위치 / MSW | [`test-convention.md`](../../../docs/test-convention.md) (예정) |
| 인증 / 인가 / 토큰 저장 / Route Guard | [`auth.md`](../../../docs/auth.md) (예정) |
| PWA / Service Worker / Manifest / FCM | [`pwa-convention.md`](../../../docs/pwa-convention.md) (예정 — customer / seller 만) |
| 접근성 기준 | [`accessibility.md`](../../../docs/accessibility.md) (예정) |

## 에러 처리

| 상황 | 처리 |
|---|---|
| 노션 URL fetch 실패 | 사용자에게 알리고 중단 (URL 확인 / Notion MCP 권한 점검) |
| 노션 페이지에 정책 / scope 빈 곳 | 사용자에게 옵션 제시 → 결정 → **노션 본문 갱신** 후 진행 |
| 슬롯 모두 점유 | 사용자에게 정리 / 임시 슬롯 추가 여부 확인 후 중단 |
| 빌드 실패 (단순) | 자동 수정 후 재실행 (1~2회) |
| 빌드 실패 (복잡) | 사용자에게 원인 보고 + 결정 받기 |
| 노션 상태 갱신 실패 | 사용자에게 알리고 수동 갱신 안내 (머지는 이미 완료 — 별도 처리) |

## 주의

- **노션 single source** — 정책 / scope / 화면 흐름 / 도메인 결정은 노션 본문이 원본. plan 중 새 결정 발견 시 **노션 본문 갱신** (휘발 X)
- **두 모드 명확히** — 모드 A (메인) = plan 까지 + 슬롯 attach, 모드 B (슬롯) = 코드 작업. 한 호출로 끝내려면 Claude Code 의 `EnterWorktree` 사용
- **TDD red→green** — 테스트 작성 → 실행해서 red 확인 → 구현 → 다시 실행해서 green 확인. layer 단위 (훅 / 컴포넌트). 타입 / Zod 스키마 / 페이지 셸 / 라우트는 TDD 불가 (시그니처 / 조합)
- **이슈 시스템 사용 안 함** — GitHub Issue 생성 X. 추적 = PR + 노션 본문 체크리스트
- **외부 모델 리뷰 사용 안 함** — 빌드 통과 후 바로 머지 사이클
- **한국어 테스트 표현** — `it('...', ...)` 안에 한국어 ([test-convention.md](../../../docs/test-convention.md) 예정)
- **명시 승인 게이트 우회 X** — 커밋 메시지 / PR 본문 사용자 OK 필수. `--no-verify` 금지
- **PowerShell 5.1**: 한글 / 주석은 UTF-8 (Write tool 기본)
