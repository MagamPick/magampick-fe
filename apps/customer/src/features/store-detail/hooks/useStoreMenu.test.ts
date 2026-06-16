import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { createQueryWrapper } from '@/shared/test/queryWrapper'
import { storeDetailApi } from '../api/storeDetailApi'
import { useStoreMenu } from './useStoreMenu'

vi.mock('../api/storeDetailApi')

describe('useStoreMenu', () => {
  it('메뉴_목록_조회_성공_카테고리포함', async () => {
    vi.mocked(storeDetailApi.getStoreMenu).mockResolvedValue([
      { id: 1, name: '소금빵', imageUrl: null, price: 3000, category: '베이커리', hasActiveDeal: false },
    ])

    const { result } = renderHook(() => useStoreMenu(1), { wrapper: createQueryWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.[0].category).toBe('베이커리')
    expect(storeDetailApi.getStoreMenu).toHaveBeenCalledWith(1)
  })
})
