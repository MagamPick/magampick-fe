import { describe, it, expect, expectTypeOf } from 'vitest'
import { z } from 'zod'
import { nullish, nullableString, nullableNumber, nullableBoolean } from './zodNullable'

describe('zodNullable 헬퍼 (null-trap 방지)', () => {
  const schema = z.object({
    name: nullableString(),
    count: nullableNumber(),
    flag: nullableBoolean(),
    tags: nullish(z.array(z.string())),
    kind: nullish(z.enum(['A', 'B'])),
  })

  it('BE가_null로_내려도_throw하지_않고_undefined로_정규화한다', () => {
    const parsed = schema.parse({ name: null, count: null, flag: null, tags: null, kind: null })
    expect(parsed).toEqual({
      name: undefined,
      count: undefined,
      flag: undefined,
      tags: undefined,
      kind: undefined,
    })
  })

  it('키가_아예_없어도_통과한다_옵셔널_유지', () => {
    expect(() => schema.parse({})).not.toThrow()
    expect(schema.parse({})).toEqual({})
  })

  it('실제_값은_그대로_통과한다', () => {
    const parsed = schema.parse({ name: 'a', count: 3, flag: false, tags: ['x'], kind: 'B' })
    expect(parsed).toEqual({ name: 'a', count: 3, flag: false, tags: ['x'], kind: 'B' })
  })

  it('falsy_유효값_0_false_빈문자열은_보존한다', () => {
    const parsed = schema.parse({ name: '', count: 0, flag: false })
    expect(parsed.name).toBe('')
    expect(parsed.count).toBe(0)
    expect(parsed.flag).toBe(false)
  })

  it('잘못된_타입은_여전히_거부한다', () => {
    expect(() => schema.parse({ count: 'not-a-number' })).toThrow()
  })

  it('추론_타입이_기존_optional과_동일하게_T_undefined_로_유지된다', () => {
    type Parsed = z.infer<typeof schema>
    expectTypeOf<Parsed['name']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<Parsed['count']>().toEqualTypeOf<number | undefined>()
    expectTypeOf<Parsed['flag']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<Parsed['tags']>().toEqualTypeOf<string[] | undefined>()
  })
})
