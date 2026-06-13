import { describe, it, expect } from 'vitest'
import { toListParams, ALL_FILTER } from './inquiryFilters'

describe('toListParams (필터 → API 파라미터)', () => {
  it('전체(all) 필터는 undefined 로 변환', () => {
    expect(toListParams(ALL_FILTER, ALL_FILTER, 0)).toEqual({
      status: undefined,
      category: undefined,
      page: 0,
    })
  })

  it('구체 상태·카테고리·페이지를 그대로 전달', () => {
    expect(toListParams('pending', 'payment', 2)).toEqual({
      status: 'pending',
      category: 'payment',
      page: 2,
    })
  })

  it('한쪽만 지정해도 다른쪽은 전체(undefined)', () => {
    expect(toListParams('answered', ALL_FILTER, 0)).toEqual({
      status: 'answered',
      category: undefined,
      page: 0,
    })
  })
})
