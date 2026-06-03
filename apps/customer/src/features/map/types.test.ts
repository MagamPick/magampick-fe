import { describe, expect, it } from 'vitest'
import { mapDistanceSchema, mapStoreSchema, mapStoresParamsSchema } from './types'

describe('지도 매장 조회 스키마', () => {
  const validStore = {
    id: 'st-1',
    name: '베이커리 브레드샵',
    imageUrl: null,
    latitude: 37.5571,
    longitude: 126.925,
    distanceKm: 0.3,
    rating: 4.6,
    activeDealCount: 2,
    maxDiscountRate: 40,
  }

  it('mapStoreSchema_유효_매장_파스', () => {
    expect(mapStoreSchema.parse(validStore)).toEqual(validStore)
  })

  it('mapStoreSchema_imageUrl_문자열도_허용', () => {
    const withImg = { ...validStore, imageUrl: 'https://example.com/a.jpg' }
    expect(mapStoreSchema.parse(withImg).imageUrl).toBe('https://example.com/a.jpg')
  })

  it('mapDistanceSchema_1_3_5만_허용하고_2는_거부', () => {
    expect(mapDistanceSchema.parse(1)).toBe(1)
    expect(mapDistanceSchema.parse(3)).toBe(3)
    expect(mapDistanceSchema.parse(5)).toBe(5)
    expect(() => mapDistanceSchema.parse(2)).toThrow()
  })

  it('mapStoresParamsSchema_중심좌표_반경_토글_파스', () => {
    const params = { latitude: 37.55, longitude: 126.92, radiusKm: 3, dealsOnly: true }
    expect(mapStoresParamsSchema.parse(params)).toEqual(params)
  })
})
