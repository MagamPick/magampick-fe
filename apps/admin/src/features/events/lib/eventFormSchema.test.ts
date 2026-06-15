import { describe, it, expect } from 'vitest'
import { makeEventFormSchema, type EventFormValues } from './eventFormSchema'

const TODAY = '2026-06-13'

/** 통과하는 생성 입력 베이스 (today 2026-06-13 기준) */
function validInput(over: Partial<EventFormValues> = {}): EventFormValues {
  return {
    label: '여름 마감 쿠폰',
    discountType: 'RATE',
    value: '10',
    minOrder: '10000',
    unlimited: false,
    issueLimit: '100',
    validUntil: '2026-07-31',
    displayStartAt: '2026-06-20',
    displayEndAt: '2026-07-20',
    ...over,
  }
}

/** safeParse 후 해당 필드(path[0])에 이슈가 달렸는지 */
function errorOn(schema: ReturnType<typeof makeEventFormSchema>, input: EventFormValues, field: keyof EventFormValues): boolean {
  const r = schema.safeParse(input)
  if (r.success) return false
  return r.error.issues.some((i) => i.path[0] === field)
}

describe('makeEventFormSchema', () => {
  const createSchema = makeEventFormSchema({ requireFutureDates: true, today: TODAY })
  const editSchema = makeEventFormSchema({ requireFutureDates: false, today: TODAY })

  it('유효한 생성 입력은 통과', () => {
    expect(createSchema.safeParse(validInput()).success).toBe(true)
  })

  describe('label', () => {
    it('공백/빈값은 실패', () => {
      expect(errorOn(createSchema, validInput({ label: '   ' }), 'label')).toBe(true)
    })
  })

  describe('value — discountType 의존', () => {
    it('RATE 1~100 통과, 0·101 실패', () => {
      expect(createSchema.safeParse(validInput({ discountType: 'RATE', value: '1' })).success).toBe(true)
      expect(createSchema.safeParse(validInput({ discountType: 'RATE', value: '100' })).success).toBe(true)
      expect(errorOn(createSchema, validInput({ discountType: 'RATE', value: '0' }), 'value')).toBe(true)
      expect(errorOn(createSchema, validInput({ discountType: 'RATE', value: '101' }), 'value')).toBe(true)
    })
    it('AMOUNT ≥1 통과(상한 없음), 0 실패', () => {
      expect(createSchema.safeParse(validInput({ discountType: 'AMOUNT', value: '1' })).success).toBe(true)
      expect(createSchema.safeParse(validInput({ discountType: 'AMOUNT', value: '50000' })).success).toBe(true)
      expect(errorOn(createSchema, validInput({ discountType: 'AMOUNT', value: '0' }), 'value')).toBe(true)
    })
    it('숫자가 아니면 실패', () => {
      expect(errorOn(createSchema, validInput({ value: '1x' }), 'value')).toBe(true)
    })
  })

  describe('minOrder', () => {
    it('0 허용, 음수/문자 실패', () => {
      expect(createSchema.safeParse(validInput({ minOrder: '0' })).success).toBe(true)
      expect(errorOn(createSchema, validInput({ minOrder: '-1' }), 'minOrder')).toBe(true)
    })
  })

  describe('issueLimit — 무제한 토글', () => {
    it('무제한 ON 이면 issueLimit 비어도 통과', () => {
      expect(createSchema.safeParse(validInput({ unlimited: true, issueLimit: '' })).success).toBe(true)
    })
    it('무제한 OFF 이면 1 이상 필수', () => {
      expect(errorOn(createSchema, validInput({ unlimited: false, issueLimit: '' }), 'issueLimit')).toBe(true)
      expect(errorOn(createSchema, validInput({ unlimited: false, issueLimit: '0' }), 'issueLimit')).toBe(true)
      expect(createSchema.safeParse(validInput({ unlimited: false, issueLimit: '1' })).success).toBe(true)
    })
  })

  describe('교차검증', () => {
    it('① displayStart > displayEnd 차단(displayEndAt)', () => {
      const input = validInput({ displayStartAt: '2026-07-21', displayEndAt: '2026-07-20' })
      expect(errorOn(createSchema, input, 'displayEndAt')).toBe(true)
    })
    it('② validUntil < displayEnd 차단(validUntil)', () => {
      const input = validInput({ validUntil: '2026-07-19', displayEndAt: '2026-07-20' })
      expect(errorOn(createSchema, input, 'validUntil')).toBe(true)
    })
    it('validUntil == displayEnd 는 통과(경계)', () => {
      expect(createSchema.safeParse(validInput({ validUntil: '2026-07-20', displayEndAt: '2026-07-20' })).success).toBe(true)
    })
  })

  describe('requireFutureDates', () => {
    it('생성: 과거 날짜는 실패', () => {
      expect(errorOn(createSchema, validInput({ displayStartAt: '2026-06-01' }), 'displayStartAt')).toBe(true)
    })
    it('수정: 과거 displayStart 허용(진행중 이벤트)', () => {
      // 과거 시작 + 미래 종료/만료 — 교차검증은 만족
      const input = validInput({ displayStartAt: '2026-05-01' })
      expect(editSchema.safeParse(input).success).toBe(true)
    })
  })
})
