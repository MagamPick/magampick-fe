import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createQueryWrapper } from '@/shared/test/queryWrapper'
import { SettlementCard } from './SettlementCard'
import { opsApi } from '../api/opsApi'

vi.mock('../api/opsApi')

function renderCard() {
  render(<SettlementCard />, { wrapper: createQueryWrapper() })
}

beforeEach(() => vi.clearAllMocks())
afterEach(() => vi.restoreAllMocks())

describe('SettlementCard', () => {
  it('confirm 취소 시 정산 API 를 호출하지 않는다', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    renderCard()

    await userEvent.click(screen.getByRole('button', { name: '정산 실행' }))

    expect(opsApi.processSettlement).not.toHaveBeenCalled()
  })

  it('confirm 수락 + 날짜 미입력 → undefined 로 실행하고 처리 건수를 표시(0건도 정상)', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    vi.mocked(opsApi.processSettlement).mockResolvedValue({ processedCount: 0 })
    renderCard()

    await userEvent.click(screen.getByRole('button', { name: '정산 실행' }))

    expect(opsApi.processSettlement).toHaveBeenCalledWith(undefined)
    expect(await screen.findByText(/0건 처리/)).toBeInTheDocument()
  })

  it('처리 건수(N건)를 표시한다', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    vi.mocked(opsApi.processSettlement).mockResolvedValue({ processedCount: 7 })
    renderCard()

    await userEvent.click(screen.getByRole('button', { name: '정산 실행' }))

    expect(await screen.findByText(/7건 처리/)).toBeInTheDocument()
  })
})
