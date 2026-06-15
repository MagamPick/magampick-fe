import { describe, it, expect } from 'vitest'
import { haversineKm } from './geoDistance'

describe('geoDistance', () => {
  it('동일_좌표는_0km', () => {
    const p = { latitude: 37.5571, longitude: 126.925 }
    expect(haversineKm(p, p)).toBe(0)
  })

  it('위도_1도_차이는_약_111km', () => {
    const d = haversineKm({ latitude: 0, longitude: 0 }, { latitude: 1, longitude: 0 })
    expect(d).toBeCloseTo(111.19, 1)
  })

  it('서울시청_강남역_약_8km', () => {
    // 시청(37.5663,126.9779) ↔ 강남역(37.4979,127.0276) ≈ 8.4km
    const d = haversineKm(
      { latitude: 37.5663, longitude: 126.9779 },
      { latitude: 37.4979, longitude: 127.0276 },
    )
    expect(d).toBeGreaterThan(8)
    expect(d).toBeLessThan(9)
  })

  it('인자_순서_무관_대칭', () => {
    const a = { latitude: 37.5, longitude: 127.0 }
    const b = { latitude: 37.6, longitude: 127.1 }
    expect(haversineKm(a, b)).toBeCloseTo(haversineKm(b, a), 6)
  })
})
