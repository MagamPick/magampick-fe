import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useProducts } from './useProducts'
import { productApi } from '../api/productApi'
import { createQueryWrapper } from '@/shared/test/queryWrapper'
import type { Product } from '../types'

vi.mock('../api/productApi')

describe('useProducts', () => {
  beforeEach(() => vi.clearAllMocks())

  it('현재 매장의 상품 목록을 조회한다', async () => {
    const list: Product[] = [
      { id: 1, storeId: 1, name: '아메리카노', category: 'BEVERAGE', price: 3000, onSale: true },
    ]
    vi.mocked(productApi.listProducts).mockResolvedValue(list)

    const { result } = renderHook(() => useProducts(1), { wrapper: createQueryWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(productApi.listProducts).toHaveBeenCalledWith(1)
    expect(result.current.data).toEqual(list)
  })
})
