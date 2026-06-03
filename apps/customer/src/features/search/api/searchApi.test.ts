import { describe, it, expect } from 'vitest'
import { searchApi } from './searchApi'

describe('searchApi.search (키워드 검색 mock)', () => {
  it('매장명_매칭은_매장_섹션에', async () => {
    const r = await searchApi.search({ q: '브레드', sort: 'recommended' })
    expect(r.stores.length).toBeGreaterThan(0)
    expect(r.stores.every((s) => s.name.includes('브레드'))).toBe(true)
  })

  it('상품명_매칭은_상품_섹션에', async () => {
    const r = await searchApi.search({ q: '크루아상', sort: 'recommended' })
    expect(r.products.length).toBeGreaterThan(0)
    expect(r.products.every((p) => p.name.includes('크루아상'))).toBe(true)
  })

  it('소속_상품만_매칭된_매장은_매장섹션에_안_들어온다', async () => {
    // '크루아상'은 상품명 — 그 상품을 파는 매장이라도 매장명에 '크루아상'이 없으면 매장 섹션 0건
    const r = await searchApi.search({ q: '크루아상', sort: 'recommended' })
    expect(r.stores).toHaveLength(0)
  })

  it('매장·상품_둘다_매칭되면_각_섹션에_분리', async () => {
    const r = await searchApi.search({ q: '베이글', sort: 'recommended' })
    expect(r.stores.length).toBeGreaterThan(0)
    expect(r.products.length).toBeGreaterThan(0)
  })

  it('매칭_없으면_양쪽_빈_배열', async () => {
    const r = await searchApi.search({ q: '존재하지않는검색어zzz', sort: 'recommended' })
    expect(r.stores).toHaveLength(0)
    expect(r.products).toHaveLength(0)
  })

  it('거리순은_가까운_매장부터', async () => {
    const r = await searchApi.search({ q: '브레드', sort: 'distance' })
    const dists = r.stores.map((s) => s.distanceKm)
    expect(dists).toEqual([...dists].sort((a, b) => a - b))
  })

  it('할인율순은_상품_할인율_내림차순', async () => {
    const r = await searchApi.search({ q: '베이글', sort: 'discount' })
    const rates = r.products.map((p) => ('discountRate' in p ? p.discountRate : 0))
    expect(rates).toEqual([...rates].sort((a, b) => b - a))
  })
})

describe('searchApi.autocomplete (자동완성 mock)', () => {
  it('부분_입력으로_유사_매장명·상품명_제안', async () => {
    const s = await searchApi.autocomplete({ q: '크루' })
    expect(s.length).toBeGreaterThan(0)
    expect(s.some((x) => x.text.includes('크루아상'))).toBe(true)
  })

  it('오타도_유사도로_매칭_pg_trgm', async () => {
    const s = await searchApi.autocomplete({ q: '크로아상' }) // 오타
    expect(s.some((x) => x.text === '크루아상')).toBe(true)
  })

  it('매장·상품을_kind로_구분', async () => {
    const s = await searchApi.autocomplete({ q: '베이' })
    expect(s.some((x) => x.kind === 'store')).toBe(true)
    expect(s.some((x) => x.kind === 'product')).toBe(true)
  })

  it('빈_입력은_빈_배열', async () => {
    expect(await searchApi.autocomplete({ q: '' })).toEqual([])
    expect(await searchApi.autocomplete({ q: '   ' })).toEqual([])
  })

  it('매칭_없으면_빈_배열', async () => {
    expect(await searchApi.autocomplete({ q: 'zzz존재안함' })).toEqual([])
  })

  it('최대_8개로_제한', async () => {
    const s = await searchApi.autocomplete({ q: '아' }) // 광범위 매칭
    expect(s.length).toBeLessThanOrEqual(8)
  })
})
