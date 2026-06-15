import { describe, it, expect } from 'vitest'
import { formatDistance } from './formatDistance'

describe('formatDistance', () => {
  it('1km 미만은 소수 1자리 km 로 표기한다', () => {
    expect(formatDistance(0.0226516565)).toBe('0.0km')
    expect(formatDistance(0.08840695868)).toBe('0.1km')
    expect(formatDistance(0.15383301561)).toBe('0.2km')
    expect(formatDistance(0.3)).toBe('0.3km')
    expect(formatDistance(0.8)).toBe('0.8km')
  })

  it('1km 이상도 소수 1자리 km 로 표기한다', () => {
    expect(formatDistance(1)).toBe('1.0km')
    expect(formatDistance(1.234)).toBe('1.2km')
    expect(formatDistance(12.96)).toBe('13.0km')
  })

  it('거리가 0 이면 "0km" 로 표기한다 (소수점 생략)', () => {
    expect(formatDistance(0)).toBe('0km')
  })
})
