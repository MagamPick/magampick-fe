import type { ReactNode } from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useInquiries } from './useInquiries'
import { useAnswerInquiry } from './useAnswerInquiry'
import { inquiryKeys } from './inquiryKeys'
import { inquiryApi } from '../api/inquiryApi'
import type { InquiryPage, InquiryView } from '../types'

vi.mock('../api/inquiryApi')

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  return { queryClient, wrapper }
}

const answered: InquiryView = {
  id: 2,
  category: 'order',
  title: '주문 취소 문의',
  content: '주문을 취소하고 싶어요.',
  status: 'answered',
  createdAt: '2026-06-09',
  answer: { content: '취소 처리해 드렸습니다.', answeredAt: '2026-06-11' },
}

const emptyPage: InquiryPage = {
  content: [],
  page: 0,
  size: 20,
  totalCount: 0,
  totalPages: 0,
  hasNext: false,
  hasPrevious: false,
}

beforeEach(() => vi.clearAllMocks())

describe('useInquiries', () => {
  it('주어진 파라미터로 목록을 조회', async () => {
    vi.mocked(inquiryApi.listInquiries).mockResolvedValue(emptyPage)
    const { wrapper } = setup()
    const { result } = renderHook(() => useInquiries({ status: 'pending', page: 1 }), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(inquiryApi.listInquiries).toHaveBeenCalledWith({ status: 'pending', page: 1 })
  })
})

describe('useAnswerInquiry', () => {
  it('성공 시 id·content 로 호출하고 목록을 무효화', async () => {
    vi.mocked(inquiryApi.answerInquiry).mockResolvedValue(answered)
    const { queryClient, wrapper } = setup()
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useAnswerInquiry(2), { wrapper })

    result.current.mutate('취소 처리해 드렸습니다.')

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(inquiryApi.answerInquiry).toHaveBeenCalledWith(2, '취소 처리해 드렸습니다.')
    expect(invalidate).toHaveBeenCalledWith({ queryKey: inquiryKeys.lists() })
  })

  it('실패(409/404 등)에도 목록을 무효화(서버 상태 변경 반영, onSettled)', async () => {
    vi.mocked(inquiryApi.answerInquiry).mockRejectedValue(new Error('409'))
    const { queryClient, wrapper } = setup()
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useAnswerInquiry(2), { wrapper })

    result.current.mutate('이미 답변된 문의')

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(invalidate).toHaveBeenCalledWith({ queryKey: inquiryKeys.lists() })
  })
})
