import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest'
import { MemoryRouter } from 'react-router'
import { StoreRegisterForm } from './StoreRegisterForm'
import { storeApi } from '../api/storeApi'
import { searchStoreAddress } from '@/features/auth/lib/addressSearch'
import { useCurrentStoreStore } from '../stores/currentStoreStore'
import { createQueryWrapper } from '@/shared/test/queryWrapper'
import { ApiError } from '@/shared/lib/apiError'
import type { StoreAddress } from '../types'

vi.mock('../api/storeApi')
vi.mock('@/features/auth/lib/addressSearch', () => ({
  searchStoreAddress: vi.fn(),
}))

const navigateSpy = vi.fn()
vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>()
  return { ...actual, useNavigate: () => navigateSpy }
})

const mockAddress: StoreAddress = {
  roadAddress: '서울 마포구 신촌로 123',
  zonecode: '04101',
  sigunguCode: '11440',
  roadnameCode: '1234567',
}

function renderForm() {
  const Wrapper = createQueryWrapper()
  return render(
    <Wrapper>
      <MemoryRouter>
        <StoreRegisterForm />
      </MemoryRouter>
    </Wrapper>,
  )
}

// 개업일자 — 캘린더(ko) 시트를 열고 과거 날짜(6/10) 클릭. setSystemTime 으로 기준일 6/15 고정.
async function pickOpenDate(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByText('날짜를 선택하세요'))
  await user.click(await screen.findByText('10'))
}

describe('StoreRegisterForm', () => {
  beforeAll(() => {
    URL.createObjectURL = vi.fn(() => 'blob:preview')
    URL.revokeObjectURL = vi.fn()
  })
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 5, 15)) // 2026-06-15
    useCurrentStoreStore.setState({ selectedStoreId: 1 })
  })
  afterEach(() => vi.useRealTimers())

  it('조회 전에는 [매장 등록] 버튼이 비활성', () => {
    renderForm()
    expect(screen.getByRole('button', { name: '매장 등록' })).toBeDisabled()
  })

  it('사업자 조회 실패(BUSINESS_INFO_MISMATCH) 시 에러 안내를 노출하고 제출은 계속 비활성', async () => {
    vi.mocked(storeApi.checkBusinessNumber).mockRejectedValue(
      new ApiError(400, 'BUSINESS_INFO_MISMATCH', '조회되지 않는 사업자등록번호입니다'),
    )
    const user = userEvent.setup()
    renderForm()

    await user.type(screen.getByPlaceholderText('대표자 실명'), '김사장')
    await user.type(screen.getByPlaceholderText('000-00-00000'), '0001234567')
    await pickOpenDate(user)
    await user.click(screen.getByRole('button', { name: '조회하기' }))

    expect(await screen.findByText(/조회되지 않는 사업자등록번호입니다/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '매장 등록' })).toBeDisabled()
  })

  it('사진 선택 시 미리보기 노출', async () => {
    renderForm()
    const input = screen.getByLabelText('매장 대표 사진')
    const file = new File(['img'], 'store.png', { type: 'image/png' })

    fireEvent.change(input, { target: { files: [file] } })

    expect(await screen.findByAltText('매장 대표 사진 미리보기')).toBeInTheDocument()
  })

  it('필수 입력 + 조회 성공 + 주소 검색 완료 시 매장 등록 버튼 활성화 → 제출하면 새 매장 선택 + 홈 이동', async () => {
    vi.mocked(storeApi.checkBusinessNumber).mockResolvedValue(undefined)
    vi.mocked(searchStoreAddress).mockResolvedValue(mockAddress)
    vi.mocked(storeApi.createStore).mockResolvedValue({
      id: 3,
      name: '마감픽 베이커리 신촌점',
      operationStatus: 'CLOSED_TODAY',
    })
    const user = userEvent.setup()
    renderForm()

    await user.type(screen.getByPlaceholderText('대표자 실명'), '김사장')
    await user.type(screen.getByPlaceholderText('000-00-00000'), '1234567890')
    await pickOpenDate(user)
    await user.type(screen.getByPlaceholderText('예) 마감픽 베이커리 신촌점'), '마감픽 베이커리 신촌점')

    // 주소 검색 (Daum mock → 즉시 resolve)
    await user.click(screen.getByRole('button', { name: '주소 검색' }))
    await waitFor(() =>
      expect(screen.getByPlaceholderText('주소를 검색하세요')).toHaveValue('서울 마포구 신촌로 123'),
    )

    await user.type(screen.getByPlaceholderText('02-0000-0000'), '02-1234-5678')

    // 사업자 조회
    await user.click(screen.getByRole('button', { name: '조회하기' }))
    expect(await screen.findByText('정상 등록된 사업자입니다.')).toBeInTheDocument()

    const submit = screen.getByRole('button', { name: '매장 등록' })
    expect(submit).toBeEnabled()
    await user.click(submit)

    await waitFor(() => expect(storeApi.createStore).toHaveBeenCalledTimes(1))
    expect(storeApi.createStore).toHaveBeenCalledWith(
      expect.objectContaining({
        representativeName: '김사장',
        businessNumber: '123-45-67890',
        openDate: '2026-06-10',
        name: '마감픽 베이커리 신촌점',
        roadAddress: '서울 마포구 신촌로 123',
        phone: '02-1234-5678',
        sigunguCode: '11440',
        roadnameCode: '1234567',
        zonecode: '04101',
      }),
    )
    await waitFor(() => expect(navigateSpy).toHaveBeenCalledWith('/'))
    expect(useCurrentStoreStore.getState().selectedStoreId).toBe(3)
  })
})
