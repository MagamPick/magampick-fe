import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router'
import { StoreEditForm } from './StoreEditForm'
import { storeApi } from '../api/storeApi'
import { createQueryWrapper } from '@/shared/test/queryWrapper'
import type { StoreDetail } from '../types'

vi.mock('../api/storeApi')

const navigateSpy = vi.fn()
vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>()
  return { ...actual, useNavigate: () => navigateSpy }
})

const detail: StoreDetail = {
  id: 1,
  storeName: '마감픽 베이커리 역삼점',
  storeAddress: '서울 강남구 역삼로 180',
  storeAddressDetail: '1층',
  storePhone: '02-501-1234',
  photoAdded: true,
}

function renderForm() {
  const Wrapper = createQueryWrapper()
  return render(
    <Wrapper>
      <MemoryRouter>
        <StoreEditForm detail={detail} />
      </MemoryRouter>
    </Wrapper>,
  )
}

describe('StoreEditForm', () => {
  beforeEach(() => vi.clearAllMocks())

  it('현재 매장 정보로 미리 채워진다 (매장명·주소·상세·전화·사진)', () => {
    renderForm()
    expect(screen.getByDisplayValue('마감픽 베이커리 역삼점')).toBeInTheDocument()
    expect(screen.getByDisplayValue('서울 강남구 역삼로 180')).toBeInTheDocument()
    expect(screen.getByDisplayValue('1층')).toBeInTheDocument()
    expect(screen.getByDisplayValue('02-501-1234')).toBeInTheDocument()
    expect(screen.getByText('대표 사진 등록 완료')).toBeInTheDocument()
  })

  it('수정 불가 필드(사업자번호·대표자명·개업일자 진위확인)는 표시하지 않는다', () => {
    renderForm()
    expect(screen.queryByText('사업자등록번호')).not.toBeInTheDocument()
    expect(screen.queryByText('대표자명')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '조회하기' })).not.toBeInTheDocument()
  })

  it('매장명을 비우면 저장 버튼이 비활성', async () => {
    const user = userEvent.setup()
    renderForm()
    await user.clear(screen.getByDisplayValue('마감픽 베이커리 역삼점'))
    expect(screen.getByRole('button', { name: '저장' })).toBeDisabled()
  })

  it('매장명 변경 후 저장하면 updateStore(현재 매장) 호출 + 매장 관리로 이동', async () => {
    vi.mocked(storeApi.updateStore).mockResolvedValue({
      ...detail,
      storeName: '마감픽 베이커리 역삼본점',
    })
    const user = userEvent.setup()
    renderForm()

    const nameInput = screen.getByDisplayValue('마감픽 베이커리 역삼점')
    await user.clear(nameInput)
    await user.type(nameInput, '마감픽 베이커리 역삼본점')

    const save = screen.getByRole('button', { name: '저장' })
    expect(save).toBeEnabled()
    await user.click(save)

    await waitFor(() => expect(storeApi.updateStore).toHaveBeenCalledTimes(1))
    expect(storeApi.updateStore).toHaveBeenCalledWith(
      expect.objectContaining({
        storeId: 1,
        storeName: '마감픽 베이커리 역삼본점',
        storeAddress: '서울 강남구 역삼로 180',
        storePhone: '02-501-1234',
      }),
    )
    await waitFor(() => expect(navigateSpy).toHaveBeenCalledWith('/store'))
  })
})
