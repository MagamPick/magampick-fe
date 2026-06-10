import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router'
import { createQueryWrapper } from '@/shared/test/queryWrapper'
import { StoreDetailPage } from './StoreDetailPage'
import { useStoreDetail } from '../hooks/useStoreDetail'
import { useStoreDetailRefresh } from '../hooks/useStoreDetailRefresh'
import { useStoreDeals } from '../hooks/useStoreDeals'
import { useToggleFavorite } from '@/features/favorites/hooks/useToggleFavorite'
import type { StoreDetail } from '../types'

vi.mock('../hooks/useStoreDetail')
vi.mock('../hooks/useStoreDetailRefresh')
vi.mock('../hooks/useStoreDeals')
vi.mock('@/features/favorites/hooks/useToggleFavorite')

const STORE: StoreDetail = {
  id: 1,
  name: '브레드샵',
  imageUrl: null,
  businessStatus: 'OPEN',
  closingTime: '21:00',
  rating: 4.8,
  reviewCount: 10,
  distanceKm: 0.3,
  isFavorite: true, // BE 실값 — 단골 등록 상태
  address: '서울 마포구',
  phone: '02-1234-5678',
  businessNumber: '123-45-67890',
  operatingHours: [],
  lat: 37.55,
  lng: 126.92,
}

const mutate = vi.fn()

function renderAt(path: string) {
  const Wrapper = createQueryWrapper()
  return render(
    <Wrapper>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/store/:id" element={<StoreDetailPage />} />
        </Routes>
      </MemoryRouter>
    </Wrapper>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(useStoreDetail).mockReturnValue({
    data: STORE,
    isPending: false,
    isError: false,
    refetch: vi.fn(),
  } as unknown as ReturnType<typeof useStoreDetail>)
  vi.mocked(useStoreDetailRefresh).mockReturnValue(vi.fn() as unknown as ReturnType<typeof useStoreDetailRefresh>)
  vi.mocked(useStoreDeals).mockReturnValue({
    data: [],
    isPending: false,
    isError: false,
  } as unknown as ReturnType<typeof useStoreDeals>)
  vi.mocked(useToggleFavorite).mockReturnValue({
    mutate,
    isPending: false,
  } as unknown as ReturnType<typeof useToggleFavorite>)
})

describe('StoreDetailPage', () => {
  it('isFavorite_BE_실값_하트_상태_반영_그리고_클릭시_toggle_mutate_호출', async () => {
    const user = userEvent.setup()
    renderAt('/store/1')

    // isFavorite=true → 단골 해제 버튼
    const favBtn = await screen.findByRole('button', { name: '단골 해제' })
    expect(favBtn).toHaveAttribute('aria-pressed', 'true')

    await user.click(favBtn)
    // next=false (현재 true 이므로 해제 방향)
    expect(mutate).toHaveBeenCalledWith({ storeId: 1, next: false })
  })

  it('isFavorite_false_일때_단골등록_버튼_노출_그리고_mutate_호출', async () => {
    vi.mocked(useStoreDetail).mockReturnValue({
      data: { ...STORE, isFavorite: false },
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useStoreDetail>)

    const user = userEvent.setup()
    renderAt('/store/1')

    const favBtn = await screen.findByRole('button', { name: '단골 등록' })
    expect(favBtn).toHaveAttribute('aria-pressed', 'false')

    await user.click(favBtn)
    expect(mutate).toHaveBeenCalledWith({ storeId: 1, next: true })
  })
})
