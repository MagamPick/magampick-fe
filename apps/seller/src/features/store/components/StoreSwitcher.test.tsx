import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router'
import { StoreSwitcher } from './StoreSwitcher'
import { storeApi } from '../api/storeApi'
import { useCurrentStoreStore } from '../stores/currentStoreStore'
import { createQueryWrapper } from '@/shared/test/queryWrapper'

vi.mock('../api/storeApi')

const navigateSpy = vi.fn()
vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>()
  return { ...actual, useNavigate: () => navigateSpy }
})

const STORES = [
  { id: 1, name: '마감픽 베이커리 역삼점', operationStatus: 'OPEN' as const },
  { id: 2, name: '마감픽 베이커리 강남점', operationStatus: 'CLOSED_TODAY' as const },
]

function renderSwitcher() {
  const Wrapper = createQueryWrapper()
  return render(
    <Wrapper>
      <MemoryRouter>
        <StoreSwitcher />
      </MemoryRouter>
    </Wrapper>,
  )
}

describe('StoreSwitcher — 매장 전환 모달 (보유 매장 목록 조회)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(storeApi.getStores).mockResolvedValue(STORES)
    useCurrentStoreStore.setState({ selectedStoreId: 1 })
  })

  it('각 매장의 영업 상태 라벨을 함께 보여준다', async () => {
    const user = userEvent.setup()
    renderSwitcher()
    await user.click(await screen.findByRole('button', { name: '매장 전환' }))

    expect(await screen.findByText('영업중')).toBeInTheDocument()
    expect(screen.getByText('오늘 종료')).toBeInTheDocument()
  })

  it('매장 선택 시 현재 매장이 갱신된다', async () => {
    const user = userEvent.setup()
    renderSwitcher()
    await user.click(await screen.findByRole('button', { name: '매장 전환' }))
    await user.click(await screen.findByText('마감픽 베이커리 강남점'))

    expect(useCurrentStoreStore.getState().selectedStoreId).toBe(2)
  })

  it('[매장 추가] 누르면 매장 등록 화면(/store/new)으로 이동', async () => {
    const user = userEvent.setup()
    renderSwitcher()
    await user.click(await screen.findByRole('button', { name: '매장 전환' }))
    await user.click(await screen.findByRole('button', { name: /매장 추가/ }))

    expect(navigateSpy).toHaveBeenCalledWith('/store/new')
  })

  it('chip variant 는 현재 매장명 칩을 보여주고 같은 전환 시트를 연다(통계 헤더용)', async () => {
    const user = userEvent.setup()
    const Wrapper = createQueryWrapper()
    render(
      <Wrapper>
        <MemoryRouter>
          <StoreSwitcher variant="chip" />
        </MemoryRouter>
      </Wrapper>,
    )
    // 로드되면 칩에 현재 매장명이 뜬다(전환 전엔 칩에만 존재)
    expect(await screen.findByText('마감픽 베이커리 역삼점')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '매장 전환' }))
    expect(await screen.findByText('영업중')).toBeInTheDocument()
  })

  it('selectedStoreId 가 null 이면 첫 번째 매장을 자동 선택한다 (init-from-list)', async () => {
    useCurrentStoreStore.setState({ selectedStoreId: null })
    renderSwitcher()
    // 목록(async) 로드 후 effect 가 selectStore(stores[0].id) 실행 → selectedStoreId = 1
    await waitFor(() => expect(useCurrentStoreStore.getState().selectedStoreId).toBe(1))
  })
})
