import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../hooks/useProduct')
vi.mock('../hooks/useDeleteProduct')
vi.mock('@/features/clearance/hooks/useClearances')
vi.mock('@/features/store/hooks/useStoreStatus')

import { useProduct } from '../hooks/useProduct'
import { useDeleteProduct } from '../hooks/useDeleteProduct'
import { useClearances } from '@/features/clearance/hooks/useClearances'
import { useStoreStatus } from '@/features/store/hooks/useStoreStatus'
import { ProductDetailPage } from './ProductDetailPage'
import type { Product } from '../types'
import type { ClearanceView } from '@/features/clearance/types'

const product: Product = {
  id: 1,
  storeId: 1,
  name: '통밀 식빵',
  category: 'BAKERY',
  price: 4800,
  onSale: true,
}

const delMutate = vi.fn()

function setup(opts?: { product?: Product; clearances?: ClearanceView[]; open?: boolean }) {
  vi.mocked(useProduct).mockReturnValue({
    data: opts?.product ?? product,
    isLoading: false,
    isError: false,
  } as unknown as ReturnType<typeof useProduct>)
  vi.mocked(useClearances).mockReturnValue({
    data: opts?.clearances ?? [],
    isLoading: false,
  } as unknown as ReturnType<typeof useClearances>)
  vi.mocked(useStoreStatus).mockReturnValue({
    data: {
      storeId: 1,
      operationStatus: opts?.open === false ? 'BREAK' : 'OPEN',
      canOpenToday: true,
      todayCloseTime: '21:00',
    },
  } as unknown as ReturnType<typeof useStoreStatus>)
  vi.mocked(useDeleteProduct).mockReturnValue({
    mutate: delMutate,
    isPending: false,
  } as unknown as ReturnType<typeof useDeleteProduct>)

  return render(
    <MemoryRouter initialEntries={['/products/1']}>
      <Routes>
        <Route path="/products/:id" element={<ProductDetailPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

const activeClearance: ClearanceView = {
  id: 1,
  productId: 1,
  salePrice: 2400,
  totalQty: 20,
  soldQty: 8,
  closeTime: '21:00',
  status: 'OPEN',
  createdAt: '2026-06-01T08:00:00.000Z',
  productName: '통밀 식빵',
  originalPrice: 4800,
  remainingQty: 12,
}

describe('ProductDetailPage', () => {
  beforeEach(() => vi.clearAllMocks())

  // page-background-token-trap: 사장 화면 셸은 흰색(bg-card) — 회색(bg-background) 금지
  it('화면 셸 배경은 흰색(bg-card)을 유지한다', () => {
    const { container } = setup()
    expect(container.firstElementChild).toHaveClass('bg-card')
    expect(container.firstElementChild).not.toHaveClass('bg-background')
  })

  it('상품 정보와 수정·떨이 등록 진입을 보여준다', () => {
    setup()
    expect(screen.getByText('상품 정보')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /이 상품으로 마감 할인 등록/ })).toHaveAttribute(
      'href',
      '/clearance/new?productId=1',
    )
    expect(screen.getByRole('link', { name: /상품 수정/ })).toHaveAttribute(
      'href',
      '/products/1/edit',
    )
  })

  it('판매중지 상품은 떨이 등록 CTA를 비활성화하고 사유를 보여준다', () => {
    setup({ product: { ...product, onSale: false } })
    expect(screen.getByText('판매 중인 상품만 마감 할인으로 등록할 수 있어요')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /이 상품으로 마감 할인 등록/ })).not.toBeInTheDocument()
  })

  it('이미 진행 중인 떨이가 있으면 떨이 등록 CTA를 비활성화한다', () => {
    setup({ clearances: [activeClearance] })
    expect(screen.getByText('이미 진행 중인 마감 할인이 있어요')).toBeInTheDocument()
  })

  it('삭제를 누르면 확인 시트가 열리고 확인 시 deleteProduct 를 호출한다', async () => {
    const user = userEvent.setup()
    setup()

    await user.click(screen.getByRole('button', { name: /상품 삭제/ }))
    expect(await screen.findByText('이 상품을 삭제할까요?')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '삭제' }))
    expect(delMutate).toHaveBeenCalled()
  })
})
