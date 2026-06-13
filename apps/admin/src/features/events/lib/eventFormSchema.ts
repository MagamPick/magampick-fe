import { z } from 'zod'

const INT_RE = /^\d+$/

/** discountType 의존 값 범위 — RATE 1~100 / AMOUNT ≥1 (상한 없음) */
function valueInRange(type: 'RATE' | 'AMOUNT', n: number): boolean {
  return type === 'RATE' ? n >= 1 && n <= 100 : n >= 1
}

/**
 * 이벤트 생성/수정 폼 입력 스키마(베이스). 숫자 필드는 문자열로 들고(clearance 패턴),
 * api 계층 제출 시 number 로 변환한다. 교차검증·미래날짜는 makeEventFormSchema 가 부여.
 */
const eventFormBaseSchema = z.object({
  label: z.string().trim().min(1, '라벨을 입력해 주세요'),
  discountType: z.enum(['RATE', 'AMOUNT']),
  value: z.string().regex(INT_RE, '숫자를 입력해 주세요'),
  minOrder: z.string().regex(INT_RE, '0 이상 숫자를 입력해 주세요'),
  unlimited: z.boolean(),
  issueLimit: z.string(),
  validUntil: z.string().min(1, '날짜를 선택해 주세요'),
  displayStartAt: z.string().min(1, '날짜를 선택해 주세요'),
  displayEndAt: z.string().min(1, '날짜를 선택해 주세요'),
})

export type EventFormValues = z.infer<typeof eventFormBaseSchema>

export interface EventFormSchemaOptions {
  /** 생성 폼만 true — 날짜 3개를 오늘 이후로 강제(@FutureOrPresent). 수정은 false(진행중 과거 displayStart 허용). */
  requireFutureDates: boolean
  /** 오늘 "yyyy-MM-dd" (테스트 주입으로 결정성 확보) */
  today: string
}

/**
 * 모드별 이벤트 폼 스키마 팩토리.
 * - value: discountType 의존 범위 (RATE 1~100 / AMOUNT ≥1)
 * - issueLimit: 무제한이면 검증 skip, 아니면 정수 ≥1
 * - 미래날짜(requireFutureDates): 날짜 3개 ≥ today
 * - 교차검증 ①: displayStartAt ≤ displayEndAt (노출기간 역전 차단)
 * - 교차검증 ②: validUntil ≥ displayEndAt (B6-1 죽은 쿠폰 차단 — BE 미검증, 폼이 유일 방어선)
 *
 * 날짜는 "yyyy-MM-dd" 문자열이라 사전식 비교 = 시간순 비교.
 */
export function makeEventFormSchema({ requireFutureDates, today }: EventFormSchemaOptions) {
  return eventFormBaseSchema
    .refine(
      (d) => d.discountType !== 'RATE' || !INT_RE.test(d.value) || valueInRange('RATE', Number(d.value)),
      { message: '할인율은 1~100 사이여야 해요', path: ['value'] },
    )
    .refine(
      (d) => d.discountType !== 'AMOUNT' || !INT_RE.test(d.value) || valueInRange('AMOUNT', Number(d.value)),
      { message: '1원 이상 입력해 주세요', path: ['value'] },
    )
    .refine((d) => d.unlimited || (INT_RE.test(d.issueLimit) && Number(d.issueLimit) >= 1), {
      message: '발급 수량은 1 이상이어야 해요',
      path: ['issueLimit'],
    })
    .refine((d) => !requireFutureDates || !d.validUntil || d.validUntil >= today, {
      message: '오늘 이후 날짜를 선택해 주세요',
      path: ['validUntil'],
    })
    .refine((d) => !requireFutureDates || !d.displayStartAt || d.displayStartAt >= today, {
      message: '오늘 이후 날짜를 선택해 주세요',
      path: ['displayStartAt'],
    })
    .refine((d) => !requireFutureDates || !d.displayEndAt || d.displayEndAt >= today, {
      message: '오늘 이후 날짜를 선택해 주세요',
      path: ['displayEndAt'],
    })
    .refine((d) => !d.displayStartAt || !d.displayEndAt || d.displayStartAt <= d.displayEndAt, {
      message: '노출 종료일은 시작일 이후여야 해요',
      path: ['displayEndAt'],
    })
    .refine((d) => !d.validUntil || !d.displayEndAt || d.validUntil >= d.displayEndAt, {
      message: '쿠폰 만료일은 노출 종료일 이후여야 해요',
      path: ['validUntil'],
    })
}
