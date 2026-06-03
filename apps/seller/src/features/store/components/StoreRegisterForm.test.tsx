import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { MemoryRouter } from 'react-router'
import { StoreRegisterForm } from './StoreRegisterForm'
import { storeApi } from '../api/storeApi'
import { useCurrentStoreStore } from '../stores/currentStoreStore'
import { createQueryWrapper } from '@/shared/test/queryWrapper'
import { ApiError } from '@/shared/lib/apiError'

vi.mock('../api/storeApi')

const navigateSpy = vi.fn()
vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>()
  return { ...actual, useNavigate: () => navigateSpy }
})

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
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers({ toFake: ['Date'] }) // Date 만 고정 (setTimeout 은 실제 — userEvent 정상 동작)
    vi.setSystemTime(new Date(2026, 5, 15)) // 2026-06-15
    useCurrentStoreStore.setState({ selectedStoreId: 's1' })
  })
  afterEach(() => vi.useRealTimers())

  it('조회 전에는 [매장 등록] 버튼이 비활성', () => {
    renderForm()
    expect(screen.getByRole('button', { name: '매장 등록' })).toBeDisabled()
  })

  it('사업자 조회 실패(000 시작) 시 에러 안내를 노출하고 제출은 계속 비활성', async () => {
    vi.mocked(storeApi.checkBusinessNumber).mockRejectedValue(
      new ApiError(404, 'BUSINESS_NUMBER_INVALID', '조회되지 않는 사업자등록번호입니다'),
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

  it('필수 입력 + 조회 성공 시 활성화 → 제출하면 새 매장 선택 + 홈 이동', async () => {
    vi.mocked(storeApi.checkBusinessNumber).mockResolvedValue({ verified: true })
    vi.mocked(storeApi.createStore).mockResolvedValue({
      id: 's3',
      name: '마감픽 베이커리 신촌점',
      operationStatus: 'CLOSED_TODAY',
    })
    const user = userEvent.setup()
    renderForm()

    await user.type(screen.getByPlaceholderText('대표자 실명'), '김사장')
    await user.type(screen.getByPlaceholderText('000-00-00000'), '1234567890')
    await pickOpenDate(user)
    await user.type(screen.getByPlaceholderText('예) 마감픽 베이커리 신촌점'), '마감픽 베이커리 신촌점')
    await user.click(screen.getByRole('button', { name: '주소 검색' }))
    await user.click(await screen.findByText('서울 마포구 신촌로 123'))
    await user.type(screen.getByPlaceholderText('02-0000-0000'), '02-1234-5678')

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
        storeName: '마감픽 베이커리 신촌점',
        storeAddress: '서울 마포구 신촌로 123',
        storePhone: '02-1234-5678',
      }),
    )
    await waitFor(() => expect(navigateSpy).toHaveBeenCalledWith('/'))
    expect(useCurrentStoreStore.getState().selectedStoreId).toBe('s3')
  })
})
