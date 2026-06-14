# 마감픽 E2E (Playwright)

대상 = **배포된 dev** (실 BE `api.dev.magampick.com`). 로컬 빌드/서버 없음. **CI 게이트 아님** —
로컬/수동 실행. (CI 는 lint+build 만 돌리고, 이 패키지엔 build/lint/test 스크립트가 없어 `pnpm -r` 에서 스킵된다.)

> 계획·전략·기능영역 분해의 단일 앵커: `../../magampick_docs/working/qa/e2e-plan.md`.
> 이 README 는 *돌리는 법*만 다룬다.

## 구조 (e2e-plan §2)

```
e2e/
  fixtures/   # 공용 fixtures (config 헬퍼·API 시딩·데이터 격리·인증·토스 mock)
  customer/   # 소비자(dev.magampick.com) app-local 스펙
  seller/     # 사장(owner.dev.magampick.com) app-local 스펙
  admin/      # 관리자(admin.dev.magampick.com) app-local 스펙
  journeys/   # cross-app 멀티컨텍스트
```

스펙 수집 = `*/**/*.spec.ts` (fixtures 는 스펙 아님). 프로젝트별 baseURL 은 `playwright.config.ts`.

## 돌리는 법

```sh
pnpm --filter e2e test:e2e              # 전체
pnpm --filter e2e test:e2e:customer     # 소비자만
pnpm --filter e2e exec playwright test customer/addresses   # 특정 폴더
pnpm --filter e2e test:e2e:ui           # UI 모드
pnpm --filter e2e report                # 마지막 리포트 열기
```

Playwright 1.60 + chromium 은 워크스페이스에 이미 설치됨. 없으면 `pnpm --filter e2e exec playwright install chromium`.

## 데이터 격리 (병렬 안전)

각 테스트는 `fixtures/test.ts` 의 `customer` fixture 로 **고유 소비자 계정을 dev 에 즉석 가입**한다
(이메일 `qa.e2e.*@magampick.test`). 서로 다른 계정이라 병렬 실행이 안전하고, 계정은 `_seed/README §7`
의 `qa.%` cleanup SQL 로 일괄 회수된다.

## 인증 (UI 로그인 불필요)

`customerPage` fixture = 그 소비자로 **인증 부팅된** 페이지. 원리: 로그인 응답의 refresh_token 쿠키를
BrowserContext 쿠키 자에 적재 → FE↔BE 가 same-site(`*.magampick.com`)라 `/auth/refresh` XHR 에 쿠키가
자동 동봉 → `AuthBootstrap` 가 access 토큰을 복구. (access 는 메모리 전용이라 직접 주입 불가 — 쿠키 경유.)

```ts
import { test, expect } from '../fixtures/test'

test('내 주소 목록', async ({ customerPage }) => {
  await customerPage.goto('/addresses')
  await expect(customerPage.getByText('집')).toBeVisible() // 가입 기본 주소
})
```

## 자동 불가 (mock/수동)

- **토스 결제창**: `fixtures/toss.ts` (현재 scaffold — 주문 스윗에서 오케스트레이터가 완성). 실 결제 왕복 1회는 수동.
- **FCM 푸시 실수신**: 자동 불가 → 수동 (알림센터 *표시* 검증만 자동 가능).
- **GPS**: `context.setGeolocation` mock (config 에서 기본 좌표 주입). **이미지 업로드**: 실 파일 업로드(실 OCI dev).
