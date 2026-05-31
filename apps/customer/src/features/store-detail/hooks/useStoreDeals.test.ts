import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { createQueryWrapper } from '@/shared/test/queryWrapper'
import { storeDetailApi } from '../api/storeDetailApi'
import { useStoreDeals } from './useStoreDeals'

vi.mock('../api/storeDetailApi')

describe('useStoreDeals', () => {
  it('떨이_목록_조회_성공', async () => {
    vi.mocked(storeDetailApi.getStoreDeals).mockResolvedValue([
      {
        id: 'sd-1',
        name: '크루아상 세트',
        imageUrl: null,
        discountRate: 50,
        originalPrice: 9000,
        salePrice: 4500,
        pickupDeadline: new Date(Date.now() + 600_000).toISOString(),
        stockLeft: 5,
      },
    ])

    const { result } = renderHook(() => useStoreDeals('st-1'), { wrapper: createQueryWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(1)
    expect(result.current.data?.[0].name).toBe('크루아상 세트')
  })
})
