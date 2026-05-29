# Form Convention

react-hook-form + Zod + shadcn `<Form>` 조합. 검증 / 타입 / 리렌더 / UI / 접근성 한 번에.

---

## 1. 기본 구성 — 4부품

```
┌────────────────────────────────────────────────────┐
│ 1. Zod 스키마 (검증 룰 + 타입 자동 추론)             │
│    ↓ resolver                                       │
│ 2. useForm (폼 인스턴스, ref 기반 비제어)            │
│    ↓ {...form}                                      │
│ 3. shadcn <Form> + <FormField> (UI + 접근성)         │
│    ↓ handleSubmit(onSubmit)                         │
│ 4. 제출 — useMutation 호출 (서버 요청)               │
└────────────────────────────────────────────────────┘
```

---

## 2. Zod 스키마 — 위치 / 네이밍

도메인별 `features/{도메인}/types.ts` 에 스키마 정의. 폼 / API / URL state 가 같은 스키마 공유.

```ts
// features/auth/types.ts
import { z } from 'zod'

export const passwordSchema = z.string()
  .min(8, '8자 이상')
  .regex(/[A-Za-z]/, '영문 1자 이상')
  .regex(/\d/, '숫자 1자 이상')
  .regex(/[^A-Za-z\d]/, '특수문자 1자 이상')

export const loginInputSchema = z.object({
  email: z.string().email('이메일 형식이 아닙니다'),
  password: passwordSchema,
  keepSignedIn: z.boolean().default(true),
})
export type LoginInput = z.infer<typeof loginInputSchema>
```

### 규칙

- **이름**: `{action}InputSchema` (`loginInputSchema`, `createProductInputSchema`)
- **타입 추론**: `z.infer<typeof schema>` — 수동 interface 정의 X
- **공유 룰** (예: 비밀번호) 은 별도 스키마로 추출해서 여러 폼에 재사용
- **에러 메시지는 한국어** — Zod 정의에 직접 (`.email('이메일 형식이 아닙니다')`)

---

## 3. useForm + shadcn `<Form>`

```tsx
// features/auth/pages/LoginPage.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/shared/components/ui/form'
import { Input } from '@/shared/components/ui/input'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { Button } from '@/shared/components/ui/button'
import { loginInputSchema, type LoginInput } from '../types'
import { useLogin } from '../hooks/useLogin'

export function LoginPage() {
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginInputSchema),
    defaultValues: { email: '', password: '', keepSignedIn: true },
  })

  const login = useLogin()

  function onSubmit(values: LoginInput) {
    login.mutate(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>이메일</FormLabel>
              <FormControl><Input type="email" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>비밀번호</FormLabel>
              <FormControl><Input type="password" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="keepSignedIn"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-2">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <FormLabel>로그인 상태 유지</FormLabel>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={login.isPending}>
          {login.isPending ? '로그인 중...' : '로그인'}
        </Button>
      </form>
    </Form>
  )
}
```

### 핵심

- `useForm<TypeName>({ resolver: zodResolver(schema) })` — 타입 + 검증 한 번에
- `defaultValues` 명시 — 비제어 → 제어 전환 경고 방지
- `<FormField>` 가 `name` 으로 자동 연결 (`register` 직접 호출 X)
- `<FormMessage />` 가 Zod 에러 메시지 자동 표시
- `form.handleSubmit(onSubmit)` 이 검증 후 통과하면 onSubmit 호출

---

## 4. 제출 — useMutation 연동

폼은 입력 + 검증, **제출 / 서버 호출은 useMutation 이 책임**.

```ts
// features/auth/hooks/useLogin.ts
export function useLogin() {
  const setAccessToken = useAuthStore(s => s.setAccessToken)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (input: LoginInput) => authApi.login(input),
    onSuccess: ({ accessToken }) => {
      setAccessToken(accessToken)
      navigate('/')
    },
  })
}
```

```tsx
// 컴포넌트
const login = useLogin()
function onSubmit(values: LoginInput) {
  login.mutate(values)
}
```

### 로딩 / 에러 처리

- **로딩**: `login.isPending` → 버튼 disabled
- **서버 에러**: `login.error` (ApiError) → 컴포넌트가 표시 (toast / form 위 에러 박스)
- **필드별 서버 에러** (`fieldErrors`): `form.setError('email', { message: '...' })` 로 폼에 주입

```tsx
useEffect(() => {
  if (login.error?.fieldErrors) {
    login.error.fieldErrors.forEach(({ field, message }) => {
      form.setError(field as keyof LoginInput, { message })
    })
  }
}, [login.error])
```

---

## 5. 검증 모드

`useForm` 의 `mode` 옵션:

| mode | 동작 |
|---|---|
| `onSubmit` (기본) | 제출 시점만 검증 |
| `onBlur` | 필드 떠날 때 검증 |
| `onChange` | 입력마다 검증 (즉시 피드백) |
| `onTouched` | 한 번 blur 된 후부터 onChange |
| `all` | 모든 시점 |

### 추천

- **로그인 / 간단한 폼** = `onSubmit` (기본) — 사용자가 입력 중 빨간 줄 X
- **회원가입 / 복잡한 폼** = `onBlur` 또는 `onTouched` — 필드 이탈 시 피드백
- **결제 / 중요 폼** = `onChange` — 즉시 피드백으로 실수 방지

```ts
const form = useForm({ resolver: zodResolver(schema), mode: 'onBlur' })
```

---

## 6. 동적 필드 (useFieldArray)

배열 필드 (예: 상품 옵션 여러 개) 는 `useFieldArray`:

```tsx
const form = useForm<{ items: { name: string; price: number }[] }>({ ... })
const { fields, append, remove } = useFieldArray({ control: form.control, name: 'items' })

return (
  <Form {...form}>
    {fields.map((field, index) => (
      <div key={field.id}>
        <FormField name={`items.${index}.name`} render={({ field }) => (...)} />
        <FormField name={`items.${index}.price`} render={({ field }) => (...)} />
        <Button onClick={() => remove(index)}>삭제</Button>
      </div>
    ))}
    <Button onClick={() => append({ name: '', price: 0 })}>추가</Button>
  </Form>
)
```

`field.id` 는 react-hook-form 이 자동 부여 — `key` 로 사용 (배열 index X — 삽입/삭제 시 깨짐).

---

## 7. 의존 필드 (watch)

특정 필드 값에 따라 다른 필드 활성화 / 표시:

```tsx
const form = useForm<{ deliveryType: 'pickup' | 'address'; address: string }>({ ... })
const deliveryType = form.watch('deliveryType')

return (
  <Form {...form}>
    <FormField name="deliveryType" ... />
    {deliveryType === 'address' && (
      <FormField name="address" ... />
    )}
  </Form>
)
```

> 마감픽은 픽업 전용이라 deliveryType 같은 분기 없음. 다른 컨텍스트 예시.

조건부 검증은 Zod 의 `.refine()` 또는 `discriminatedUnion`:

```ts
const schema = z.discriminatedUnion('deliveryType', [
  z.object({ deliveryType: z.literal('pickup') }),
  z.object({ deliveryType: z.literal('address'), address: z.string().min(1) }),
])
```

---

## 8. 폼 reset / defaultValues

### 초기값

```ts
const form = useForm<Input>({
  resolver: zodResolver(schema),
  defaultValues: { email: '', password: '' },  // 명시 권장
})
```

### 비동기 초기값 (수정 폼)

```ts
const { data: product } = useProductDetail(id)

const form = useForm<UpdateInput>({
  resolver: zodResolver(updateInputSchema),
  values: product,  // ★ defaultValues 가 아닌 values — 비동기 도착 후 자동 reset
})
```

`values` prop 은 외부 값이 바뀔 때 자동 재초기화. 수정 폼은 거의 이거.

### 제출 후 reset

```ts
const create = useCreateProduct()

function onSubmit(values: CreateInput) {
  create.mutate(values, {
    onSuccess: () => form.reset()  // 폼 비움
  })
}
```

---

## 9. 입력 마스킹 / 포맷

휴대폰 번호 / 사업자번호 / 금액 같은 포맷 입력은 **별도 라이브러리** 또는 **수동 처리**.

### MVP 추천 — 수동 처리

```tsx
<FormField
  name="phone"
  render={({ field }) => (
    <FormItem>
      <FormLabel>휴대폰 번호</FormLabel>
      <FormControl>
        <Input
          {...field}
          onChange={(e) => {
            const formatted = formatPhone(e.target.value)  // shared/lib 의 헬퍼
            field.onChange(formatted)
          }}
          placeholder="010-1234-5678"
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

```ts
// shared/lib/formatters.ts
export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length < 4) return digits
  if (digits.length < 8) return `${digits.slice(0, 3)}-${digits.slice(3)}`
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
}
```

### 마스킹 라이브러리 (필요해지면)

- `react-imask` — 강력하지만 무거움
- 도입 시점은 마스킹 필요 화면이 5개 이상 늘어났을 때

---

## 10. 파일 업로드 (이미지 등)

shadcn 에 파일 input 컴포넌트 없음 — 직접 작성:

```tsx
const form = useForm<{ image: File | null }>({
  resolver: zodResolver(z.object({
    image: z.instanceof(File, { message: '이미지를 선택해주세요' })
      .refine(f => f.size < 5 * 1024 * 1024, '5MB 이하만 가능')
      .refine(f => ['image/png', 'image/jpeg'].includes(f.type), 'PNG / JPEG 만 가능')
  })),
})

return (
  <FormField
    name="image"
    render={({ field: { onChange, ...rest } }) => (
      <FormItem>
        <FormLabel>이미지</FormLabel>
        <FormControl>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => onChange(e.target.files?.[0] ?? null)}
            {...rest}
            value={undefined}  // file input 은 controlled X
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
)
```

서버 전송 시 `FormData`:
```ts
const formData = new FormData()
formData.append('image', values.image)
// axios 가 자동으로 Content-Type 설정
```

---

## 11. 폼 코드 위치

| 폼 영역 | 위치 |
|---|---|
| **Zod 스키마 + 타입** | `features/{도메인}/types.ts` |
| **폼 컴포넌트** | `features/{도메인}/pages/` 또는 `features/{도메인}/components/` |
| **제출 mutation 훅** | `features/{도메인}/hooks/use{Action}.ts` |
| **공통 입력 컴포넌트** (있다면) | `shared/components/forms/` |

큰 폼이면 페이지 안에 인라인 X — 별도 컴포넌트로 분리 (`LoginForm.tsx`).

---

## 12. 안티 패턴

- ❌ **useState 로 폼 만들기** — react-hook-form 의 가치 다 잃음 (성능 / 검증 / 타입)
- ❌ **`onChange` 마다 Zod 검증 직접** — `mode: 'onChange'` 옵션 사용
- ❌ **interface 수동 정의 + Zod 별도** — `z.infer<typeof schema>` 로 자동 추론 (단일 진실)
- ❌ **`field.onChange` 우회한 setState 패턴** — react-hook-form 의 상태 관리에 맡기기
- ❌ **검증 룰을 컴포넌트 안에 인라인** — Zod 스키마는 `types.ts` 에서 정의, 컴포넌트는 사용만
- ❌ **shadcn `<Form>` 안 쓰고 raw input + register 직접** — `<FormField>` 가 접근성 / 에러 표시 다 처리

---

## 13. 라이브러리

```json
{
  "react-hook-form": "^7.x",
  "@hookform/resolvers": "^3.x",  // zodResolver
  "zod": "^3.x"
}
```

shadcn `<Form>` 추가:
```sh
pnpm dlx shadcn@latest add form
pnpm dlx shadcn@latest add input
pnpm dlx shadcn@latest add checkbox
# ... 필요한 입력 컴포넌트들
```

---

## 보류 / TODO

- [ ] **파일 업로드 제한** (5MB / PNG·JPEG) — docs 의 예시값. 실제 구현 시 노션 명세 / 백엔드 spec 따라 조정 (상품 이미지 / 매장 사진 / 사업자 등록증 등 도메인별)
- [ ] **입력 마스킹 라이브러리 도입 시점** — 5+ 화면 누적 시. 현재는 `shared/lib/formatters.ts` 수동
- [ ] **공통 입력 컴포넌트** (`shared/components/forms/`) — 첫 폼 작성 시 추출 필요한지 판단
- [ ] **검증 모드 정책** — "로그인 onSubmit / 가입 onBlur / 결제 onChange" 가이드. 실제 폼 작성 시 UX 결정

## 변경 이력
- 2026-05-29: 초안 작성.
