import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest'
import { MemoryRouter } from 'react-router'
import { StoreEditForm } from './StoreEditForm'
import { storeApi } from '../api/storeApi'
import { searchStoreAddress } from '@/features/auth/lib/addressSearch'
import { createQueryWrapper } from '@/shared/test/queryWrapper'
import type { StoreDetail, StoreAddress } from '../types'

vi.mock('../api/storeApi')
vi.mock('@/features/auth/lib/addressSearch', () => ({
  searchStoreAddress: vi.fn(),
}))

const navigateSpy = vi.fn()
vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>()
  return { ...actual, useNavigate: () => navigateSpy }
})

const detail: StoreDetail = {
  id: 1,
  name: '마감픽 베이커리 역삼점',
  roadAddress: '서울 강남구 역삼로 180',
  detailAddress: '1층',
  zonecode: '06242',
  phone: '02-501-1234',
  imageUrl: 'https://example.com/store.jpg',
}

function renderForm(d: StoreDetail = detail) {
  const Wrapper = createQueryWrapper()
  return render(
    <Wrapper>
      <MemoryRouter>
        <StoreEditForm detail={d} />
      </MemoryRouter>
    </Wrapper>,
  )
}

describe('StoreEditForm', () => {
  beforeAll(() => {
    URL.createObjectURL = vi.fn(() => 'blob:preview')
    URL.revokeObjectURL = vi.fn()
  })
  beforeEach(() => vi.clearAllMocks())

  it('현재 매장 정보로 미리 채워진다 (매장명·상세주소·전화)', () => {
    renderForm()
    expect(screen.getByDisplayValue('마감픽 베이커리 역삼점')).toBeInTheDocument()
    expect(screen.getByDisplayValue('1층')).toBeInTheDocument()
    expect(screen.getByDisplayValue('02-501-1234')).toBeInTheDocument()
  })

  it('주소 입력 필드에 현재 roadAddress 가 표시된다 (미변경 상태)', () => {
    renderForm()
    expect(screen.getByDisplayValue('서울 강남구 역삼로 180')).toBeInTheDocument()
  })

  it('imageUrl 이 있으면 기존 사진 미리보기가 표시된다', () => {
    renderForm()
    expect(screen.getByAltText('매장 대표 사진 미리보기')).toBeInTheDocument()
  })

  it('imageUrl 없는 매장은 사진 등록 플레이스홀더가 표시된다', () => {
    renderForm({ ...detail, imageUrl: undefined })
    expect(screen.getByText('대표 사진 등록')).toBeInTheDocument()
  })

  it('수정 불가 필드(사업자번호·대표자명·진위확인)는 표시하지 않는다', () => {
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

  it('새 파일 선택 시 미리보기 이미지가 갱신된다', async () => {
    renderForm()
    const input = screen.getByLabelText('매장 대표 사진')
    const file = new File(['img'], 'new.png', { type: 'image/png' })

    fireEvent.change(input, { target: { files: [file] } })

    expect(await screen.findByAltText('매장 대표 사진 미리보기')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '사진 제거' })).toBeInTheDocument()
  })

  it('주소 검색 시 Daum 위젯 호출 + 입력 필드 갱신', async () => {
    const newAddress: StoreAddress = {
      roadAddress: '서울 강남구 테헤란로 152',
      zonecode: '06235',
      sigunguCode: '11680',
      roadnameCode: '3179999',
    }
    vi.mocked(searchStoreAddress).mockResolvedValue(newAddress)
    const user = userEvent.setup()
    renderForm()

    await user.click(screen.getByRole('button', { name: '주소 검색' }))

    await waitFor(() =>
      expect(screen.getByDisplayValue('서울 강남구 테헤란로 152')).toBeInTheDocument(),
    )
  })

  it('매장명 변경 후 저장하면 updateStore 호출 + 매장 관리로 이동 (주소 변경 없음 시 주소 필드 omit)', async () => {
    vi.mocked(storeApi.updateStore).mockResolvedValue({
      ...detail,
      name: '마감픽 베이커리 역삼본점',
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
    const callArg = vi.mocked(storeApi.updateStore).mock.calls[0]?.[0]
    expect(callArg).toMatchObject({
      storeId: 1,
      name: '마감픽 베이커리 역삼본점',
      phone: '02-501-1234',
    })
    // 주소 변경 없음 → roadAddress/sigunguCode 등 omit
    expect(callArg).not.toHaveProperty('roadAddress')
    expect(callArg).not.toHaveProperty('sigunguCode')
    await waitFor(() => expect(navigateSpy).toHaveBeenCalledWith('/store'))
  })

  it('주소 재검색 후 저장하면 주소 필드(road+코드들)가 updateStore 에 포함된다', async () => {
    const newAddress: StoreAddress = {
      roadAddress: '서울 강남구 테헤란로 152',
      zonecode: '06235',
      sigunguCode: '11680',
      roadnameCode: '3179999',
    }
    vi.mocked(searchStoreAddress).mockResolvedValue(newAddress)
    vi.mocked(storeApi.updateStore).mockResolvedValue({
      ...detail,
      roadAddress: newAddress.roadAddress,
    })
    const user = userEvent.setup()
    renderForm()

    await user.click(screen.getByRole('button', { name: '주소 검색' }))
    await waitFor(() => expect(screen.getByDisplayValue('서울 강남구 테헤란로 152')).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: '저장' }))

    await waitFor(() => expect(storeApi.updateStore).toHaveBeenCalledTimes(1))
    const callArg = vi.mocked(storeApi.updateStore).mock.calls[0]?.[0]
    expect(callArg).toMatchObject({
      storeId: 1,
      roadAddress: '서울 강남구 테헤란로 152',
      sigunguCode: '11680',
      roadnameCode: '3179999',
    })
  })
})
