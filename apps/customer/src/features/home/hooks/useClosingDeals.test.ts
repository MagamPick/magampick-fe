import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { createQueryWrapper } from '@/shared/test/queryWrapper'
import { homeApi } from '../api/homeApi'
import { useClosingDeals } from './useClosingDeals'

vi.mock('../api/homeApi')

describe('useClosingDeals', () => {
  it('마감임박_목록_조회_성공', async () => {
    vi.mocked(homeApi.getClosingDeals).mockResolvedValue([
      {
        id: 1,
        storeName: '테스트 베이커리',
        productName: '크루아상',
        imageUrl: null,
        discountRate: 50,
        originalPrice: 9000,
        salePrice: 4500,
        pickupDeadline: new Date(Date.now() + 600_000).toISOString(),
      },
    ])

    const { result } = renderHook(() => useClosingDeals(), { wrapper: createQueryWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(1)
    expect(result.current.data?.[0].storeName).toBe('테스트 베이커리')
  })
})
