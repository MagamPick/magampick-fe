import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useFaqs } from './useFaqs'
import { useInquiries } from './useInquiries'
import { useSubmitInquiry } from './useSubmitInquiry'
import { supportApi } from '../api/supportApi'
import type { Inquiry } from '../types'
import { createQueryWrapper } from '@/shared/test/queryWrapper'

vi.mock('../api/supportApi')

describe('support hooks', () => {
  beforeEach(() => vi.clearAllMocks())

  it('useFaqs — FAQ 목록을 조회한다', async () => {
    vi.mocked(supportApi.listFaqs).mockResolvedValue([])
    const { result } = renderHook(() => useFaqs(), { wrapper: createQueryWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(supportApi.listFaqs).toHaveBeenCalledOnce()
  })

  it('useInquiries — 내 문의 내역을 조회한다', async () => {
    vi.mocked(supportApi.listInquiries).mockResolvedValue([])
    const { result } = renderHook(() => useInquiries(), { wrapper: createQueryWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(supportApi.listInquiries).toHaveBeenCalledOnce()
  })

  it('useSubmitInquiry — 문의를 제출한다', async () => {
    const inquiry: Inquiry = {
      id: 'iq1',
      category: 'etc',
      title: '제목입니다',
      content: '내용을 충분히 길게 적었어요',
      status: 'pending',
      createdAt: '2026-06-02',
      answer: null,
    }
    vi.mocked(supportApi.submitInquiry).mockResolvedValue(inquiry)

    const { result } = renderHook(() => useSubmitInquiry(), { wrapper: createQueryWrapper() })
    result.current.mutate({ category: 'etc', title: '제목입니다', content: '내용을 충분히 길게 적었어요' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(supportApi.submitInquiry).toHaveBeenCalledOnce()
  })
})
