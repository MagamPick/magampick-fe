import { describe, it, expect } from 'vitest'
import { storeListParamsSchema, DEFAULT_STORE_SORT } from './types'

/** URL `/all?sort=` 파싱 — 없거나 잘못된 값이면 추천순으로 fallback (페이지 크래시 방지) */
describe('storeListParamsSchema', () => {
  it('sort_없으면_추천순_default', () => {
    expect(storeListParamsSchema.parse({})).toEqual({ sort: DEFAULT_STORE_SORT })
  })

  it('유효한_sort는_그대로', () => {
    expect(storeListParamsSchema.parse({ sort: 'closing' })).toEqual({ sort: 'closing' })
  })

  it('잘못된_sort는_추천순으로_fallback', () => {
    expect(storeListParamsSchema.parse({ sort: 'garbage' })).toEqual({ sort: DEFAULT_STORE_SORT })
  })
})
