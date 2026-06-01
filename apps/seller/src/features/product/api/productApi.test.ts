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
})
