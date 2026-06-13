import { describe, it, expect } from 'vitest'
import { answerInputSchema } from './answerSchema'

describe('answerInputSchema', () => {
  it('빈 내용·공백만은 거부', () => {
    expect(answerInputSchema.safeParse({ content: '' }).success).toBe(false)
    expect(answerInputSchema.safeParse({ content: '   ' }).success).toBe(false)
  })

  it('2000자 초과는 거부', () => {
    expect(answerInputSchema.safeParse({ content: 'a'.repeat(2001) }).success).toBe(false)
  })

  it('정확히 2000자는 통과', () => {
    expect(answerInputSchema.safeParse({ content: 'a'.repeat(2000) }).success).toBe(true)
  })

  it('유효한 내용은 통과하고 trim 된다', () => {
    const r = answerInputSchema.safeParse({ content: '  답변 드립니다  ' })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.content).toBe('답변 드립니다')
  })
})
