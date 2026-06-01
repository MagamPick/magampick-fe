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
      { id: 'p1', storeId: 's1', name: '아메리카노', category: '음료', price: 3000, onSale: true },
    ]
    vi.mocked(productApi.listProducts).mockResolvedValue(list)

    const { result } = renderHook(() => useProducts('s1'), { wrapper: createQueryWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(productApi.listProducts).toHaveBeenCalledWith('s1')
    expect(result.current.data).toEqual(list)
  })
})
