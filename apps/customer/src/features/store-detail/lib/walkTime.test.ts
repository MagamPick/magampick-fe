import { describe, it, expect } from 'vitest'
import { estimateWalkMinutes, walkAndDistanceLabel } from './walkTime'

describe('walkTime', () => {
  it('직선거리_15분per_km_추정_최소1분', () => {
    expect(estimateWalkMinutes(1)).toBe(15)
    expect(estimateWalkMinutes(0.8)).toBe(12)
    expect(estimateWalkMinutes(0)).toBe(1)
  })

  it('도보분_거리_라벨', () => {
    expect(walkAndDistanceLabel(0.8)).toBe('도보 12분 · 0.8km')
  })
})
