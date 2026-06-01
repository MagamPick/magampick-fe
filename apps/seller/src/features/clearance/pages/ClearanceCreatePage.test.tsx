import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/features/product/hooks/useProducts')
vi.mock('../hooks/useClearances')
vi.mock('@/features/store/hooks/useStoreStatus')
vi.mock('../hooks/useCreateClearance')

import { useProducts } from '@/features/product/hooks/useProducts'
import { useClearances } from '../hooks/useClearances'
import { useStoreStatus } from '@/features/store/hooks/useStoreStatus'
import { useCreateClearance } from '../hooks/useCreateClearance'
import { ClearanceCreatePage } from './ClearanceCreatePage'
import type { Product } from '@/features/product/types'

const americano: Product = {
  id: 'p2',
  storeId: 's1',
  name: '아메리카노',
  category: '음료',
  price: 3000,
  onSale: true,
}

const mutate = vi.fn()

function setup(opts?: { open?: boolean; initial?: string; products?: Product[] }) {
  vi.mocked(useProducts).mockReturnValue({
    data: opts?.products ?? [americano],
    isLoading: false,
  } as unknown as ReturnType<typeof useProducts>)
  vi.mocked(useClearances).mockReturnValue({ data: [], isLoading: false } as unknown as ReturnType<
    typeof useClearances
  >)
  vi.mocked(useStoreStatus).mockReturnValue({
    data: {
      storeId: 's1',
      operationStatus: opts?.open === false ? 'BREAK' : 'OPEN',
      canOpenToday: true,
      todayCloseTime: '21:00',
    },
    isLoading: false,
  } as unknown as ReturnType<typeof useStoreStatus>)
  vi.mocked(useCreateClearance).mockReturnValue({
    mutate,
    isPending: false,
  } as unknown as ReturnType<typeof useCreateClearance>)

  return render(
    <MemoryRouter initialEntries={[opts?.initial ?? '/clearance/new']}>
      <ClearanceCreatePage />
    </MemoryRouter>,
  )
}

describe('ClearanceCreatePage', () => {
  beforeEach(() => vi.clearAllMocks())

  it('영업중(OPEN)이 아니면 등록 안내 화면을 보여준다', () => {
    setup({ open: false })
    expect(screen.getByText(/영업 중일 때만 마감 할인을 등록할 수 있어요/)).toBeInTheDocument()
    expect(screen.queryByRole('tab')).not.toBeInTheDocument()
  })

  it('상품을 선택해 다음을 누르면 수량·가격 단계로 진행하고 할인율이 자동 계산된다', async () => {
    const user = userEvent.setup()
    setup()

    // STEP 1 — 상품 선택 전엔 다음 비활성
    const next = screen.getByRole('button', { name: '다음' })
    expect(next).toBeDisabled()
    await user.click(screen.getByRole('button', { name: /아메리카노/ }))
    expect(next).toBeEnabled()
    await user.click(next)

    // STEP 2 — 수량·할인가 입력 → 할인율 표시
    await user.type(screen.getByLabelText(/마감 할인 수량/), '10')
    await user.type(screen.getByLabelText(/마감 할인가/), '1500')
    expect(screen.getByText('50%')).toBeInTheDocument()
  })

  it('할인가가 정상가 이상이면 경고하고 다음을 막는다', async () => {
    const user = userEvent.setup()
    setup()
    await user.click(screen.getByRole('button', { name: /아메리카노/ }))
    await user.click(screen.getByRole('button', { name: '다음' }))

    await user.type(screen.getByLabelText(/마감 할인 수량/), '10')
    await user.type(screen.getByLabelText(/마감 할인가/), '3000')
    expect(screen.getByText(/정상가.*보다 낮은 금액/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '다음' })).toBeDisabled()
  })

  it('?productId 로 진입하면 해당 상품이 선택되어 수량 단계부터 시작한다', () => {
    setup({ initial: '/clearance/new?productId=p2' })
    // step2 의 "선택 상품" 표기 + 상품명
    expect(screen.getByText('선택 상품')).toBeInTheDocument()
    expect(screen.getByText('아메리카노')).toBeInTheDocument()
  })
})
