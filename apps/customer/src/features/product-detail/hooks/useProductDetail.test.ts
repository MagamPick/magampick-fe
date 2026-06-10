import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { createQueryWrapper } from '@/shared/test/queryWrapper'
import { productDetailApi } from '../api/productDetailApi'
import { useProductDetail } from './useProductDetail'
import type { DealProductDetail } from '../types'

vi.mock('../api/productDetailApi')

const DEAL: DealProductDetail = {
  kind: 'deal',
  id: 1,
  storeId: 1,
  storeName: '베이커리 브레드샵',
  distanceKm: 0.3,
  businessStatus: 'OPEN',
  imageUrl: null,
  name: '크루아상 세트',
  description: null,
  rating: 4.8,
  reviewCount: 36,
  closingTime: '21:00',
  originalPrice: 9000,
  salePrice: 4500,
  discountRate: 50,
  pickupDeadline: new Date(Date.now() + 30 * 60_000).toISOString(),
  stockLeft: 5,
  dealStatus: 'ACTIVE',
}

describe('useProductDetail', () => {
  it('상품상세_떨이_조회_성공', async () => {
    vi.mocked(productDetailApi.getProductDetail).mockResolvedValue(DEAL)

    const { result } = renderHook(() => useProductDetail('deal', 1), {
      wrapper: createQueryWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.kind).toBe('deal')
    expect(result.current.data?.name).toBe('크루아상 세트')
    expect(productDetailApi.getProductDetail).toHaveBeenCalledWith('deal', 1)
  })
})
