import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router'
import { createQueryWrapper } from '@/shared/test/queryWrapper'
import { productDetailApi } from '../api/productDetailApi'
import { ProductDetailPage } from './ProductDetailPage'
import type { DealProductDetail, MenuProductDetail } from '../types'

vi.mock('../api/productDetailApi')

const deal: DealProductDetail = {
  kind: 'deal',
  id: 1,
  storeId: 1,
  storeName: '브레드샵',
  distanceKm: 0.3,
  businessStatus: 'OPEN',
  imageUrl: null,
  name: '크루아상 세트',
  description: '갓 구운 크루아상.',
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

const menu: MenuProductDetail = {
  kind: 'menu',
  id: 1,
  storeId: 1,
  storeName: '브레드샵',
  distanceKm: 0.3,
  businessStatus: 'OPEN',
  imageUrl: null,
  name: '소금빵',
  description: null,
  rating: 4.5,
  reviewCount: 10,
  closingTime: '21:00',
  price: 3500,
  isOnSale: true,
}

function LocationDisplay() {
  const loc = useLocation()
  return <div data-testid="loc">{loc.pathname + loc.search}</div>
}

function renderAt(path: string) {
  const Wrapper = createQueryWrapper()
  return render(
    <Wrapper>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/product/:kind/:productId" element={<ProductDetailPage />} />
          <Route path="/store/:id" element={<LocationDisplay />} />
        </Routes>
      </MemoryRouter>
    </Wrapper>,
  )
}

beforeEach(() => vi.clearAllMocks())

describe('ProductDetailPage', () => {
  it('떨이_카운트다운_남은개수_노출', async () => {
    vi.mocked(productDetailApi.getProductDetail).mockResolvedValue(deal)
    renderAt('/product/deal/1')

    expect(await screen.findByText('크루아상 세트')).toBeInTheDocument()
    expect(screen.getByText(/마감 ·/)).toBeInTheDocument() // 픽업 마감 + 카운트다운
    expect(screen.getByText('5개 남음')).toBeInTheDocument()
  })

  it('일반상품_카운트다운_미노출', async () => {
    vi.mocked(productDetailApi.getProductDetail).mockResolvedValue(menu)
    renderAt('/product/menu/1')

    expect(await screen.findByText('소금빵')).toBeInTheDocument()
    expect(screen.getByText('3,500원')).toBeInTheDocument()
    expect(screen.queryByText(/개 남음/)).toBeNull()
    expect(screen.queryByText(/마감 ·/)).toBeNull()
  })

  it('잘못된_kind_홈으로_리다이렉트', async () => {
    vi.mocked(productDetailApi.getProductDetail).mockResolvedValue(deal)
    renderAt('/product/bogus/1')

    // 라우트 파라미터 Zod 검증 실패 → 본문 렌더 안 됨
    expect(screen.queryByText('크루아상 세트')).toBeNull()
  })

  it('매장_미리보기_탭하면_매장상세_이동', async () => {
    vi.mocked(productDetailApi.getProductDetail).mockResolvedValue(deal)
    renderAt('/product/deal/1')

    await userEvent.click(await screen.findByText(/브레드샵/))
    expect(screen.getByTestId('loc')).toHaveTextContent('/store/1')
  })

  it('리뷰영역_탭하면_매장_리뷰탭_이동', async () => {
    vi.mocked(productDetailApi.getProductDetail).mockResolvedValue(deal)
    renderAt('/product/deal/1')

    await screen.findByText('크루아상 세트')
    await userEvent.click(screen.getByText(/리뷰 36개/))
    expect(screen.getByTestId('loc')).toHaveTextContent('/store/1?tab=review')
  })
})
