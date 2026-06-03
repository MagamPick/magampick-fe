import { describe, it, expect } from 'vitest'
import { isOrderable, businessStatusLabel } from './businessStatus'

describe('businessStatus', () => {
  it('주문가능_OPEN만_true', () => {
    expect(isOrderable('OPEN')).toBe(true)
    expect(isOrderable('BREAK')).toBe(false)
    expect(isOrderable('CLOSED_TODAY')).toBe(false)
  })

  it('상태_라벨', () => {
    expect(businessStatusLabel('OPEN')).toBe('영업중')
    expect(businessStatusLabel('BREAK')).toBe('브레이크타임')
    expect(businessStatusLabel('CLOSED_TODAY')).toContain('영업 종료')
  })
})
