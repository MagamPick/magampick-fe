import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router'
import { render, screen, waitFor } from '@testing-library/react'
import { createQueryWrapper } from '@/shared/test/queryWrapper'
import { StoreEditPage } from './StoreEditPage'
import { storeApi } from '../api/storeApi'
import { useCurrentStoreStore } from '../stores/currentStoreStore'
import type { StoreDetail } from '../types'

vi.mock('../api/storeApi')

const detail: StoreDetail = {
  id: 1,
  storeName: '마감픽 베이커리 역삼점',
  storeAddress: '서울 강남구 역삼로 180',
  storeAddressDetail: '1층',
  storePhone: '02-501-1234',
  photoAdded: true,
}

function renderPage() {
  const Wrapper = createQueryWrapper()
  return render(
    <Wrapper>
      <MemoryRouter>
        <StoreEditPage />
      </MemoryRouter>
    </Wrapper>,
  )
}

describe('StoreEditPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useCurrentStoreStore.setState({ selectedStoreId: 1 })
  })

  it('화면 셸 배경을 bg_card로 유지', () => {
    vi.mocked(storeApi.getStore).mockResolvedValue(detail)
    const { container } = renderPage()
    expect(container.firstElementChild).toHaveClass('mx-auto', 'max-w-md', 'bg-card')
    expect(container.firstElementChild).not.toHaveClass('bg-background')
  })

  it('현재 매장(selectedStoreId) 상세를 불러와 미리채움 폼을 렌더한다', async () => {
    vi.mocked(storeApi.getStore).mockResolvedValue(detail)
    renderPage()
    await waitFor(() =>
      expect(screen.getByDisplayValue('마감픽 베이커리 역삼점')).toBeInTheDocument(),
    )
    expect(storeApi.getStore).toHaveBeenCalledWith(1)
    expect(screen.getByRole('button', { name: '저장' })).toBeInTheDocument()
  })
})
