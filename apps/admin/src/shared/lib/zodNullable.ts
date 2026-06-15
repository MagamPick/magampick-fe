import { z } from 'zod'

/**
 * 서버 응답 스키마용 "널 수용" 헬퍼 (null-trap 방지).
 *
 * 배경: BE 는 선택/비어있는 필드를 JSON `null` 로 일관 직렬화한다. 반면 Zod `.optional()` 은
 * `undefined`·키 누락만 허용하고 `null` 은 거부 → 200 응답인데 `.parse()` 가 throw → "불러오지 못했어요".
 * 수기 Zod 라 필드마다 `.nullish()` 를 빠뜨려 같은 버그가 반복 재발(imageUrl·jibunAddress·zonecode·
 * description·closeReason·link …)했다 → **선택 응답 필드는 반드시 이 헬퍼로 통일**한다.
 *
 * 동작: `null` 과 키 누락을 모두 수용하되, **출력값을 `undefined` 로 정규화**한다.
 * 따라서 추론 타입이 기존 `.optional()`(= `T | undefined`)과 동일하게 유지되어, 이미 작성된
 * 매퍼·컴포넌트(소비처)를 한 줄도 건드리지 않고 null 만 너그럽게 받아낸다.
 *
 * 요청(request)·폼 스키마에는 쓰지 말 것 — 응답 파싱 전용.
 */
export function nullish<T extends z.ZodTypeAny>(
  schema: T,
): z.ZodOptional<z.ZodPipe<z.ZodNullable<T>, z.ZodTransform<z.output<T> | undefined>>> {
  // nullable().transform() 먼저, optional() 나중 — ZodOptional 이 가장 바깥에 있어야
  // z.object 내에서 키가 선택(?) 으로 추론되어 `.optional()` 과 동일한 TypeScript 타입을 얻는다.
  return schema.nullable().transform((v) => v ?? undefined).optional() as never
}

/** `z.string().nullish()` 정규화판 — 출력 `string | undefined` */
export const nullableString = () => nullish(z.string())

/** `z.number().nullish()` 정규화판 — 출력 `number | undefined` */
export const nullableNumber = () => nullish(z.number())

/** `z.boolean().nullish()` 정규화판 — 출력 `boolean | undefined` */
export const nullableBoolean = () => nullish(z.boolean())
