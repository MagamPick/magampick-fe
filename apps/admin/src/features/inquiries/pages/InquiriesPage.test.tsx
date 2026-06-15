import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { InquiriesPage } from './InquiriesPage'
import { createQueryWrapper } from '@/shared/test/queryWrapper'
import { inquiryApi } from '../api/inquiryApi'
import type { InquiryPage, InquiryView } from '../types'

vi.mock('../api/inquiryApi')

// radix Select/Dialog 가 jsdom 에서 동작하도록 PointerEvent 관련 메서드 stub
beforeAll(() => {
  Element.prototype.hasPointerCapture = vi.fn(() => false)
  Element.prototype.releasePointerCapture = vi.fn()
  Element.prototype.scrollIntoView = vi.fn()
})

const pending: InquiryView = {
  id: 1,
  category: 'payment',
  title: '결제가 안 돼요',
  content: '카드 결제가 자꾸 실패합니다.',
  status: 'pending',
  createdAt: '2026-06-10',
  answer: null,
}

const answeredView: InquiryView = {
  id: 2,
  category: 'order',
  title: '주문 취소 문의',
  content: '주문을 취소하고 싶어요.',
  status: 'answered',
  createdAt: '2026-06-09',
  answer: { content: '취소 처리해 드렸습니다.', answeredAt: '2026-06-11' },
}

function makePage(content: InquiryView[], over: Partial<InquiryPage> = {}): InquiryPage {
  return {
    content,
    page: 0,
    size: 20,
    totalCount: content.length,
    totalPages: 1,
    hasNext: false,
    hasPrevious: false,
    ...over,
  }
}

function renderPage() {
  render(<InquiriesPage />, { wrapper: createQueryWrapper() })
}

beforeEach(() => vi.clearAllMocks())

describe('InquiriesPage — 목록/상태', () => {
  it('로딩 중에는 스켈레톤을 노출', () => {
    vi.mocked(inquiryApi.listInquiries).mockReturnValue(new Promise(() => {}))
    renderPage()
    expect(screen.getByTestId('inquiries-skeleton')).toBeInTheDocument()
  })

  it('빈 목록이면 EmptyState 노출', async () => {
    vi.mocked(inquiryApi.listInquiries).mockResolvedValue(makePage([]))
    renderPage()
    expect(await screen.findByText('조건에 맞는 문의가 없어요')).toBeInTheDocument()
  })

  it('조회 실패 시 ErrorState(다시 시도) 노출', async () => {
    vi.mocked(inquiryApi.listInquiries).mockRejectedValue(new Error('boom'))
    renderPage()
    expect(await screen.findByRole('button', { name: '다시 시도' })).toBeInTheDocument()
  })

  it('목록이 있으면 제목·카테고리 라벨·상태배지를 렌더', async () => {
    vi.mocked(inquiryApi.listInquiries).mockResolvedValue(makePage([pending, answeredView]))
    renderPage()
    expect(await screen.findByText('결제가 안 돼요')).toBeInTheDocument()
    expect(screen.getByText('결제')).toBeInTheDocument() // payment 라벨
    expect(screen.getByText('답변 대기')).toBeInTheDocument()
    expect(screen.getByText('답변 완료')).toBeInTheDocument()
  })

  it('미지 category 값에도 목록이 정상 렌더(관대 파싱 — 원문 표시)', async () => {
    vi.mocked(inquiryApi.listInquiries).mockResolvedValue(
      makePage([{ ...pending, category: 'mystery' }]),
    )
    renderPage()
    expect(await screen.findByText('결제가 안 돼요')).toBeInTheDocument()
    expect(screen.getByText('mystery')).toBeInTheDocument()
  })
})

describe('InquiriesPage — 필터/페이지네이션', () => {
  it('상태 필터 변경 시 status 파라미터로 재조회(page 0)', async () => {
    vi.mocked(inquiryApi.listInquiries).mockResolvedValue(makePage([pending]))
    renderPage()
    await screen.findByText('결제가 안 돼요')

    const user = userEvent.setup()
    await user.click(screen.getByLabelText('상태 필터'))
    await user.click(await screen.findByRole('option', { name: '답변 대기' }))

    await waitFor(() =>
      expect(inquiryApi.listInquiries).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'pending', page: 0 }),
      ),
    )
  })

  it('다음 페이지 클릭 시 page 1 로 재조회', async () => {
    vi.mocked(inquiryApi.listInquiries).mockImplementation((params) =>
      Promise.resolve(
        makePage([{ ...pending, id: (params.page ?? 0) + 1 }], {
          page: params.page ?? 0,
          totalPages: 2,
          hasNext: (params.page ?? 0) === 0,
          hasPrevious: (params.page ?? 0) > 0,
        }),
      ),
    )
    renderPage()
    expect(await screen.findByText('1 / 2')).toBeInTheDocument()

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: '다음' }))

    await waitFor(() =>
      expect(inquiryApi.listInquiries).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1 }),
      ),
    )
    expect(await screen.findByText('2 / 2')).toBeInTheDocument()
  })
})

describe('InquiriesPage — 답변 다이얼로그', () => {
  it('pending 문의 열기 → 답변 입력 후 등록 → answered 뷰로 전환', async () => {
    vi.mocked(inquiryApi.listInquiries).mockResolvedValue(makePage([pending]))
    vi.mocked(inquiryApi.answerInquiry).mockResolvedValue({
      ...pending,
      status: 'answered',
      answer: { content: '확인 후 처리했습니다.', answeredAt: '2026-06-13' },
    })
    renderPage()
    const user = userEvent.setup()

    await user.click(await screen.findByText('결제가 안 돼요'))
    // 다이얼로그 — pending: 답변 입력 폼
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText('카드 결제가 자꾸 실패합니다.')).toBeInTheDocument()
    const submit = within(dialog).getByRole('button', { name: '답변 등록' })

    await user.type(
      within(dialog).getByPlaceholderText(/소비자에게 전달할 답변/),
      '확인 후 처리했습니다.',
    )
    await user.click(submit)

    // 성공 → 같은 패널이 answered 뷰(읽기 전용)로 전환, 입력 버튼 사라짐
    expect(await within(dialog).findByText('확인 후 처리했습니다.')).toBeInTheDocument()
    await waitFor(() =>
      expect(within(dialog).queryByRole('button', { name: '답변 등록' })).not.toBeInTheDocument(),
    )
    expect(inquiryApi.answerInquiry).toHaveBeenCalledWith(1, '확인 후 처리했습니다.')
  })

  it('answered 문의 열기 → 읽기 전용(답변 입력 UI 없음)', async () => {
    vi.mocked(inquiryApi.listInquiries).mockResolvedValue(makePage([answeredView]))
    renderPage()
    const user = userEvent.setup()

    await user.click(await screen.findByText('주문 취소 문의'))
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText('취소 처리해 드렸습니다.')).toBeInTheDocument()
    expect(within(dialog).queryByRole('button', { name: '답변 등록' })).not.toBeInTheDocument()
    expect(within(dialog).queryByPlaceholderText(/소비자에게 전달할 답변/)).not.toBeInTheDocument()
  })

  it('빈 답변 제출은 차단되고 검증 메시지 노출', async () => {
    vi.mocked(inquiryApi.listInquiries).mockResolvedValue(makePage([pending]))
    renderPage()
    const user = userEvent.setup()

    await user.click(await screen.findByText('결제가 안 돼요'))
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: '답변 등록' }))

    expect(await within(dialog).findByText('답변 내용을 입력해 주세요')).toBeInTheDocument()
    expect(inquiryApi.answerInquiry).not.toHaveBeenCalled()
  })
})
