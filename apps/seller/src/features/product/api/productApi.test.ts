import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/shared/lib/axios')

import { apiClient } from '@/shared/lib/axios'
import { productApi } from './productApi'

const mockProduct = {
  id: 1,
  name: '통밀 식빵',
  regularPrice: 4800,
  status: 'ON_SALE' as const,
  category: 'BAKERY' as const,
}

describe('productApi', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('listProducts', () => {
    it('storeId 로 상품 목록을 조회하고 FE 도메인 모델로 매핑한다', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: { content: [mockProduct] } })

      const result = await productApi.listProducts(1)

      expect(apiClient.get).toHaveBeenCalledWith('/seller/stores/1/products', {
        params: { page: 0, size: 100, sort: 'createdAt,desc' },
      })
      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        id: 1,
        storeId: 1,
        name: '통밀 식빵',
        price: 4800,
        onSale: true,
        category: 'BAKERY',
      })
    })

    it('content 가 비어 있으면 빈 배열을 반환한다', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: { content: [] } })
      const result = await productApi.listProducts(1)
      expect(result).toEqual([])
    })
  })

  describe('getProduct', () => {
    it('storeId + id 로 단건 상품을 조회한다', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockProduct })

      const result = await productApi.getProduct(1, 1)

      expect(apiClient.get).toHaveBeenCalledWith('/seller/stores/1/products/1')
      expect(result).toMatchObject({ id: 1, name: '통밀 식빵', price: 4800, onSale: true })
    })
  })

  describe('createProduct', () => {
    it('multipart FormData 로 상품을 등록하고 생성된 상품을 반환한다', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({
        data: { id: 2, name: '녹차 라떼', regularPrice: 5000, status: 'ON_SALE', category: 'BEVERAGE' },
      })

      const result = await productApi.createProduct(1, {
        name: '녹차 라떼',
        category: 'BEVERAGE',
        price: 5000,
        onSale: true,
      })

      expect(apiClient.post).toHaveBeenCalledWith(
        '/seller/stores/1/products',
        expect.any(FormData),
        expect.objectContaining({ headers: { 'Content-Type': 'multipart/form-data' } }),
      )
      expect(result).toMatchObject({ id: 2, name: '녹차 라떼', price: 5000, onSale: true })
    })
  })

  describe('updateProduct', () => {
    it('multipart FormData 로 상품을 수정하고 갱신된 상품을 반환한다', async () => {
      vi.mocked(apiClient.patch).mockResolvedValue({
        data: { id: 1, name: '호밀 식빵', regularPrice: 5200, status: 'SOLD_OUT', category: 'BAKERY' },
      })

      const result = await productApi.updateProduct(1, 1, {
        name: '호밀 식빵',
        category: 'BAKERY',
        price: 5200,
        onSale: false,
      })

      expect(apiClient.patch).toHaveBeenCalledWith(
        '/seller/stores/1/products/1',
        expect.any(FormData),
        expect.objectContaining({ headers: { 'Content-Type': 'multipart/form-data' } }),
      )
      expect(result).toMatchObject({ id: 1, name: '호밀 식빵', price: 5200, onSale: false })
    })
  })

  describe('deleteProduct', () => {
    it('상품을 삭제한다', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({ data: null })

      await productApi.deleteProduct(1, 1)

      expect(apiClient.delete).toHaveBeenCalledWith('/seller/stores/1/products/1')
    })
  })
})
