import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../hooks/useClearance')
vi.mock('../hooks/useUpdateClearance')
vi.mock('../hooks/useCloseClearance')
vi.mock('@/features/store/hooks/useStoreStatus')

import { useClearance } from '../hooks/useClearance'
import { useUpdateClearance } from '../hooks/useUpdateClearance'
import { useCloseClearance } from '../hooks/useCloseClearance'
import { useStoreStatus } from '@/features/store/hooks/useStoreStatus'
import { ClearanceDetailPage } from './ClearanceDetailPage'
import type { ClearanceView } from '../types'

const active: ClearanceView = {
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

const updateMutate = vi.fn()
const closeMutate = vi.fn()

function setup(clearance: ClearanceView) {
  vi.mocked(useClearance).mockReturnValue({
    data: clearance,
    isLoading: false,
    isError: false,
  } as unknown as ReturnType<typeof useClearance>)
  vi.mocked(useStoreStatus).mockReturnValue({
    data: { storeId: 1, operationStatus: 'OPEN', canOpenToday: true, todayCloseTime: '21:00' },
  } as unknown as ReturnType<typeof useStoreStatus>)
  vi.mocked(useUpdateClearance).mockReturnValue({
    mutate: updateMutate,
    isPending: false,
    isSuccess: false,
  } as unknown as ReturnType<typeof useUpdateClearance>)
  vi.mocked(useCloseClearance).mockReturnValue({
    mutate: closeMutate,
    isPending: false,
  } as unknown as ReturnType<typeof useCloseClearance>)

  return render(
    <MemoryRouter initialEntries={['/clearance/1']}>
      <Routes>
        <Route path="/clearance/:id" element={<ClearanceDetailPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ClearanceDetailPage', () => {
  beforeEach(() => vi.clearAllMocks())

  // page-background-token-trap: 사장 화면 셸은 흰색(bg-card) — 회색(bg-background) 금지
  it('화면 셸 배경은 흰색(bg-card)을 유지한다', () => {
    const { container } = setup(active)
    expect(container.firstElementChild).toHaveClass('bg-card')
    expect(container.firstElementChild).not.toHaveClass('bg-background')
  })

  it('활성 떨이는 판매 현황과 수정·조기 마감 버튼을 보여준다', () => {
    setup(active)
    expect(screen.getByText('판매 현황')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '변경 저장' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '마감 할인 조기 마감' })).toBeInTheDocument()
  })

  it('마감된 떨이는 읽기전용 — 수정·마감 버튼이 없다', () => {
    setup({ ...active, status: 'CLOSED' })
    expect(screen.getByText('마감된 마감 할인')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '변경 저장' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '마감 할인 조기 마감' })).not.toBeInTheDocument()
  })

  it('조기 마감을 누르면 확인 시트가 열리고 확인 시 closeClearance 를 호출한다', async () => {
    const user = userEvent.setup()
    setup(active)

    await user.click(screen.getByRole('button', { name: '마감 할인 조기 마감' }))
    expect(await screen.findByText('마감 할인을 지금 마감할까요?')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '마감 할인 마감' }))
    expect(closeMutate).toHaveBeenCalled()
  })

  it('할인가를 정상가 이상으로 바꾸면 경고하고 변경 저장을 막는다', async () => {
    const user = userEvent.setup()
    setup(active)

    const priceInput = await screen.findByDisplayValue('2400')
    await user.clear(priceInput)
    await user.type(priceInput, '5000')

    expect(screen.getByText(/정상가.*보다 낮은 금액/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '변경 저장' })).toBeDisabled()
  })

  it('closeReason=EXPIRED 이면 픽업 마감 시각 경과 문구를 보여준다', () => {
    setup({ ...active, status: 'CLOSED', closeReason: 'EXPIRED' })
    expect(screen.getByText(/픽업 마감 시각이 지나 마감됐어요/)).toBeInTheDocument()
    expect(screen.getByText(/마감된 마감 할인은 수정하거나 다시 시작할 수 없어요/)).toBeInTheDocument()
  })

  it('closeReason=SOLD_OUT 이면 수량 소진 문구를 보여준다', () => {
    setup({ ...active, status: 'SOLD_OUT', closeReason: 'SOLD_OUT' })
    expect(screen.getByText(/수량이 모두 소진되어 마감됐어요/)).toBeInTheDocument()
  })

  it('closeReason=MANUAL 이면 사장 직접 마감 문구를 보여준다', () => {
    setup({ ...active, status: 'CLOSED', closeReason: 'MANUAL' })
    expect(screen.getByText(/사장님이 직접 마감했어요/)).toBeInTheDocument()
  })

  it('closeReason 이 없으면 폴백 문구를 보여준다', () => {
    setup({ ...active, status: 'CLOSED' })
    expect(screen.getByText(/마감된 마감 할인이에요/)).toBeInTheDocument()
  })
})
