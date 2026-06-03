import { describe, it, expect } from 'vitest'
import { resolveInitialTab } from './tabs'

describe('resolveInitialTab', () => {
  it('review_파라미터면_리뷰_탭', () => {
    expect(resolveInitialTab('review')).toBe('review')
  })

  it('파라미터_없으면_기본_마감할인_탭', () => {
    expect(resolveInitialTab(null)).toBe('deal')
  })

  it('잘못된_값이면_기본_마감할인_탭', () => {
    expect(resolveInitialTab('bogus')).toBe('deal')
  })
})
