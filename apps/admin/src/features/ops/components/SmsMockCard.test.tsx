import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createQueryWrapper } from '@/shared/test/queryWrapper'
import { SmsMockCard } from './SmsMockCard'
import { opsApi } from '../api/opsApi'

vi.mock('../api/opsApi')

function renderCard() {
  render(<SmsMockCard />, { wrapper: createQueryWrapper() })
}

beforeEach(() => vi.clearAllMocks())

describe('SmsMockCard', () => {
  it('[mock으로 전환] 클릭 시 enabled=true 로 호출하고 성공 안내', async () => {
    vi.mocked(opsApi.setSmsMock).mockResolvedValue(undefined)
    renderCard()

    await userEvent.click(screen.getByRole('button', { name: 'mock으로 전환' }))

    expect(opsApi.setSmsMock).toHaveBeenCalledWith(true)
    expect(await screen.findByText(/mock 모드로 전환했어요/)).toBeInTheDocument()
  })

  it('[실발송으로 전환] 클릭 시 enabled=false 로 호출', async () => {
    vi.mocked(opsApi.setSmsMock).mockResolvedValue(undefined)
    renderCard()

    await userEvent.click(screen.getByRole('button', { name: '실발송으로 전환' }))

    expect(opsApi.setSmsMock).toHaveBeenCalledWith(false)
    expect(await screen.findByText(/실발송 모드로 전환했어요/)).toBeInTheDocument()
  })

  it('상태 미표시 안내 문구(조회 API 없음)를 보여준다', () => {
    renderCard()

    expect(screen.getByText(/조회 API 없음/)).toBeInTheDocument()
  })
})
