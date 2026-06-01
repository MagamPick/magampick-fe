import { describe, it, expect, beforeEach } from 'vitest'
import { productApi, resetProductState } from './productApi'
import { ApiError } from '@/shared/lib/apiError'
import type { CreateProductPayload, ProductCategory } from '../types'

const base: CreateProductPayload = {
  storeId: 's1',
  name: '녹차 라떼',
  category: '음료',
  price: 5000,
  onSale: true,
}

describe('productApi', () => {
  beforeEach(() => resetProductState())

  describe('listProducts', () => {
    it('해당 매장 상품만, 최신 등록순으로 반환한다', async () => {
      const list = await productApi.listProducts('s1')
      expect(list.length).toBeGreaterThan(0)
      expect(list.every((p) => p.storeId === 's1')).toBe(true)

      const created = await productApi.createProduct({ ...base, name: '신상 상품' })
      const after = await productApi.listProducts('s1')
      expect(after[0].id).toBe(created.id)
      expect(after[0].name).toBe('신상 상품')
    })

    it('상품이 없는 매장은 빈 배열을 반환한다', async () => {
      expect(await productApi.listProducts('s2')).toEqual([])
    })
  })

  describe('createProduct', () => {
    it('성공 시 상품을 생성하고 목록에 추가한다', async () => {
      const before = (await productApi.listProducts('s1')).length
      const created = await productApi.createProduct(base)

      expect(created.id).toBeTruthy()
      expect(created).toMatchObject({
        name: '녹차 라떼',
        category: '음료',
        price: 5000,
        onSale: true,
      })
      expect((await productApi.listProducts('s1')).length).toBe(before + 1)
    })

    it('사진 dataURL 을 imageUrl 로 저장한다', async () => {
      const created = await productApi.createProduct({
        ...base,
        imageDataUrl: 'data:image/png;base64,AAAA',
      })
      expect(created.imageUrl).toBe('data:image/png;base64,AAAA')
    })

    it('빈 설명(공백만)은 저장하지 않는다', async () => {
      const created = await productApi.createProduct({ ...base, description: '   ' })
      expect(created.description).toBeUndefined()
    })

    it('판매 토글 OFF 로도 등록할 수 있다', async () => {
      const created = await productApi.createProduct({ ...base, onSale: false })
      expect(created.onSale).toBe(false)
    })

    it('상품명이 비면 거부한다 (PRODUCT_INVALID_NAME)', async () => {
      await expect(productApi.createProduct({ ...base, name: '  ' })).rejects.toMatchObject({
        code: 'PRODUCT_INVALID_NAME',
      })
    })

    it('잘못된 카테고리는 거부한다 (PRODUCT_INVALID_CATEGORY)', async () => {
      await expect(
        productApi.createProduct({ ...base, category: '주류' as ProductCategory }),
      ).rejects.toMatchObject({ code: 'PRODUCT_INVALID_CATEGORY' })
    })

    it('음수 가격은 거부한다 (PRODUCT_INVALID_PRICE)', async () => {
      await expect(productApi.createProduct({ ...base, price: -1 })).rejects.toMatchObject({
        code: 'PRODUCT_INVALID_PRICE',
      })
    })

    it('정수가 아닌 가격은 거부한다', async () => {
      await expect(productApi.createProduct({ ...base, price: 1000.5 })).rejects.toBeInstanceOf(
        ApiError,
      )
    })
  })

  describe('getProduct', () => {
    it('id 로 상품을 조회한다', async () => {
      const p = await productApi.getProduct('p1')
      expect(p.name).toBe('통밀 식빵')
    })

    it('없는 상품은 404 로 거부한다 (PRODUCT_NOT_FOUND)', async () => {
      await expect(productApi.getProduct('nope')).rejects.toMatchObject({
        code: 'PRODUCT_NOT_FOUND',
      })
    })
  })

  describe('updateProduct', () => {
    it('필드를 수정하고 목록에 반영한다', async () => {
      const updated = await productApi.updateProduct('p1', {
        name: '호밀 식빵',
        category: '베이커리',
        price: 5200,
        onSale: false,
      })
      expect(updated).toMatchObject({ name: '호밀 식빵', price: 5200, onSale: false })

      const list = await productApi.listProducts('s1')
      expect(list.find((p) => p.id === 'p1')).toMatchObject({ name: '호밀 식빵', price: 5200 })
    })

    it('음수 가격은 거부한다 (PRODUCT_INVALID_PRICE)', async () => {
      await expect(
        productApi.updateProduct('p1', { name: '통밀 식빵', category: '베이커리', price: -1, onSale: true }),
      ).rejects.toMatchObject({ code: 'PRODUCT_INVALID_PRICE' })
    })

    it('사진을 제공하지 않으면 기존 사진을 유지한다', async () => {
      const created = await productApi.createProduct({ ...base, imageDataUrl: 'data:image/png;base64,AAAA' })
      const updated = await productApi.updateProduct(created.id, {
        name: created.name,
        category: created.category,
        price: 6000,
        onSale: true,
      })
      expect(updated.imageUrl).toBe('data:image/png;base64,AAAA')
    })
  })

  describe('deleteProduct', () => {
    it('soft delete 하면 목록·조회에서 제외된다', async () => {
      await productApi.deleteProduct('p1')
      const list = await productApi.listProducts('s1')
      expect(list.some((p) => p.id === 'p1')).toBe(false)
      await expect(productApi.getProduct('p1')).rejects.toMatchObject({ code: 'PRODUCT_NOT_FOUND' })
    })
  })
})
