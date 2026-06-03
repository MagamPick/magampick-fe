import { describe, expect, it } from 'vitest'
import { mapApi } from './mapApi'
import { mapStoreSchema } from '../types'

const CENTER = { latitude: 37.5571, longitude: 126.925 }

describe('mapApi.getMapStores', () => {
  it('반경_내_매장만_반환하고_반경_넓히면_더_많이', async () => {
    const r1 = await mapApi.getMapStores({ ...CENTER, radiusKm: 1, dealsOnly: false })
    expect(r1.length).toBeGreaterThan(0)
    expect(r1.every((s) => s.distanceKm <= 1)).toBe(true)

    const r5 = await mapApi.getMapStores({ ...CENTER, radiusKm: 5, dealsOnly: false })
    expect(r5.length).toBeGreaterThan(r1.length)
  })

  it('dealsOnly_ON이면_활성딜_없는_매장_제외', async () => {
    const on = await mapApi.getMapStores({ ...CENTER, radiusKm: 5, dealsOnly: true })
    expect(on.length).toBeGreaterThan(0)
    expect(on.every((s) => s.activeDealCount > 0)).toBe(true)
  })

  it('dealsOnly_OFF면_딜_없는_매장도_포함', async () => {
    const off = await mapApi.getMapStores({ ...CENTER, radiusKm: 5, dealsOnly: false })
    const on = await mapApi.getMapStores({ ...CENTER, radiusKm: 5, dealsOnly: true })
    expect(off.length).toBeGreaterThan(on.length)
    expect(off.some((s) => s.activeDealCount === 0)).toBe(true)
  })

  it('결과가_mapStoreSchema_배열로_파스되고_좌표를_포함', async () => {
    const r = await mapApi.getMapStores({ ...CENTER, radiusKm: 3, dealsOnly: false })
    expect(() => mapStoreSchema.array().parse(r)).not.toThrow()
    expect(r.every((s) => typeof s.latitude === 'number' && typeof s.longitude === 'number')).toBe(
      true,
    )
  })
})
