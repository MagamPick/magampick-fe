import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { ReactNode } from 'react'
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { NameEditSheet } from './NameEditSheet'
import { nameSchema } from '../types'
import { profileApi } from '../api/profileApi'
import { apiClient } from '@/shared/lib/axios'

vi.mock('@/shared/lib/axios', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}))

/** 유효한 SellerProfileResponse shape — Zod parse 통과하게 */
const beUpdatedProfile = {
  id: 1,
  email: 'minsoo@magampick.com',
  name: '박상우',
  phone: '01012345678',
}

function renderSheet() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false } },
  })
  const onOpenChange = vi.fn()
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  )
  render(<NameEditSheet open onOpenChange={onOpenChange} currentName="기존이름" />, { wrapper })
  return { onOpenChange }
}

describe('NameEditSheet', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(apiClient.patch).mockResolvedValue({ data: beUpdatedProfile })
  })
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('실명 스키마 — 2자 미만/20자 초과 거부, 2~20자 통과 (노션 AC)', () => {
    expect(nameSchema.safeParse('김').success).toBe(false) // 1자
    expect(nameSchema.safeParse('민수').success).toBe(true) // 2자
    expect(nameSchema.safeParse('가'.repeat(20)).success).toBe(true) // 20자
    expect(nameSchema.safeParse('가'.repeat(21)).success).toBe(false) // 21자
  })

  it('2자 미만이면 저장 버튼이 비활성', async () => {
    const user = userEvent.setup()
    renderSheet()
    const input = screen.getByLabelText('실명')
    await user.clear(input)
    await user.type(input, '김')
    expect(screen.getByRole('button', { name: '저장' })).toBeDisabled()
  })

  it('유효한 실명 저장 시 updateName 호출 + 시트 닫힘', async () => {
    const user = userEvent.setup()
    const spy = vi.spyOn(profileApi, 'updateName')
    const { onOpenChange } = renderSheet()
    const input = screen.getByLabelText('실명')
    await user.clear(input)
    await user.type(input, '박상우')
    await user.click(screen.getByRole('button', { name: '저장' }))
    await waitFor(() => expect(spy).toHaveBeenCalledWith('박상우'))
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false))
  })
})
