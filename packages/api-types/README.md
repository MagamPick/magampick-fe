# @magampick/api-types

백엔드 SpringDoc OpenAPI spec 에서 생성한 **TypeScript 타입 전용** 패키지. 런타임 코드 없음.

- **목적**: API 요청/응답 타입을 백엔드 spec 과 동기화 — 손으로 타입을 옮겨 적는 드리프트 제거 + LLM/개발 시 spec 을 매번 읽지 않게 토큰 절약.
- **런타임 검증 아님**: 실제 응답 검증은 기존대로 각 feature 의 Zod 스키마가 담당 (`docs/api-client-convention.md` §7). 생성 타입은 dev 편의·정합성 체크용, Zod 는 런타임 진실 게이트 — 역할 분리.

## 생성물

백엔드가 role(group)별로 분리된 spec 을 제공하므로 앱 경계와 1:1 로 생성:

| 파일 | SpringDoc group | 대응 앱 |
|---|---|---|
| `src/customer.ts` | `1. Public (소비자)` | `apps/customer` |
| `src/seller.ts` | `2. Seller (사장)` | `apps/seller` |

> admin group 은 현재 백엔드 path 0 개라 생성 안 함. 백엔드에 admin API 가 생기면 `scripts/generate.mjs` 의 `GROUPS` 에 추가.

## 재생성

```sh
# 기본: dev 백엔드(https://api.dev.magampick.com)
pnpm --filter @magampick/api-types gen

# 로컬 백엔드 등 base override
MAGAMPICK_API_DOCS_BASE=http://localhost:8080 pnpm --filter @magampick/api-types gen
```

생성 후 `git diff` 로 변경 확인하고 커밋. **생성 파일은 직접 수정 금지** — 백엔드 spec 을 고치고 재생성.

## 사용 (앱에서)

1. 앱 `package.json` 에 워크스페이스 의존성 추가 (처음 쓸 때 1회):
   ```jsonc
   "dependencies": { "@magampick/api-types": "workspace:*" }
   ```
2. 타입 import — 생성 타입은 백엔드 **envelope unwrap 이전이 아닌 `data` 페이로드** 형태 (SpringDoc 이 컨트롤러 반환 타입을 문서화, `ResponseBodyAdvice` 의 `{success,data}` 래핑은 미포함). 즉 프론트 interceptor 가 주는 `res.data` 와 그대로 맞음.
   ```ts
   import type { components, paths } from '@magampick/api-types/customer'

   // 응답 DTO
   type CustomerProfile = components['schemas']['CustomerProfileResponse']

   // 엔드포인트 단위 (요청 body / 응답)
   type SignupBody =
     paths['/api/v1/auth/signup']['post']['requestBody']['content']['*/*']
   ```
3. Zod 스키마와의 관계: 생성 타입을 "정답지" 삼아 Zod 스키마를 맞춘다. 필요하면 `z.infer<typeof schema> satisfies SomeGeneratedType` 으로 정합성 컴파일 체크.

> 마이그레이션은 점진적 — 기존 손작성 타입을 한 번에 갈아끼우지 않는다. 새/수정 feature 부터 생성 타입을 참조.
