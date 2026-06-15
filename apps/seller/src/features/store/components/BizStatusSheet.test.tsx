import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BizStatusSheet } from './BizStatusSheet'
import { useTransitionStatus } from '../hooks/useTransitionStatus'
import type { StoreStatus } from '../types'

vi.mock('../hooks/useTransitionStatus')

const mutate = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(useTransitionStatus).mockReturnValue({
    mutate,
    isPending: false,
    isError: false,
  } as unknown as ReturnType<typeof useTransitionStatus>)
})

function renderSheet(status: StoreStatus) {
  render(<BizStatusSheet open onOpenChange={() => {}} storeId={status.storeId} status={status} />)
}

describe('BizStatusSheet — 영업 상태 관리 시트', () => {
  it('OPEN 상태면 잠시 휴식·오늘 영업 종료 액션을 노출', () => {
    renderSheet({ storeId: 1, operationStatus: 'OPEN', canOpenToday: true, todayCloseTime: '21:00' })
    expect(screen.getByText('잠시 휴식')).toBeInTheDocument()
    expect(screen.getByText('오늘 영업 종료')).toBeInTheDocument()
  })

  it('휴무일(canOpenToday=false)이면 영업 시작이 비활성 + 사유를 보여준다', () => {
    renderSheet({ storeId: 2, operationStatus: 'CLOSED_TODAY', canOpenToday: false })
    expect(screen.getByRole('button', { name: /영업 시작/ })).toBeDisabled()
    expect(screen.getByText('오늘은 영업 요일이 아니에요')).toBeInTheDocument()
  })

  it('활성 액션을 클릭하면 해당 상태로 전환 mutate 를 호출', async () => {
    renderSheet({ storeId: 1, operationStatus: 'OPEN', canOpenToday: true, todayCloseTime: '21:00' })
    await userEvent.click(screen.getByRole('button', { name: /잠시 휴식/ }))
    expect(mutate).toHaveBeenCalledWith('BREAK', expect.anything())
  })
})
