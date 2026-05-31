import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { ReactNode } from 'react'
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { NicknameEditSheet } from './NicknameEditSheet'
import { nicknameSchema } from '../types'
import { profileApi, __resetProfileStoreForTest } from '../api/profileApi'

function renderSheet() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false } },
  })
  const onOpenChange = vi.fn()
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  )
  render(<NicknameEditSheet open onOpenChange={onOpenChange} currentNickname="기존닉" />, { wrapper })
  return { onOpenChange }
}

describe('NicknameEditSheet', () => {
  beforeEach(() => __resetProfileStoreForTest())
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('닉네임 스키마 — 2자 미만/12자 초과 거부, 2~12자 통과 (노션 AC)', () => {
    expect(nicknameSchema.safeParse('a').success).toBe(false) // 1자
    expect(nicknameSchema.safeParse('ab').success).toBe(true) // 2자
    expect(nicknameSchema.safeParse('가'.repeat(12)).success).toBe(true) // 12자
    expect(nicknameSchema.safeParse('가'.repeat(13)).success).toBe(false) // 13자
  })

  it('2자 미만이면 저장 버튼이 비활성', async () => {
    const user = userEvent.setup()
    renderSheet()
    const input = screen.getByLabelText('닉네임')
    await user.clear(input)
    await user.type(input, 'a')
    expect(screen.getByRole('button', { name: '저장' })).toBeDisabled()
  })

  it('유효한 닉네임 저장 시 updateNickname 호출 + 시트 닫힘', async () => {
    const user = userEvent.setup()
    const spy = vi.spyOn(profileApi, 'updateNickname')
    const { onOpenChange } = renderSheet()
    const input = screen.getByLabelText('닉네임')
    await user.clear(input)
    await user.type(input, '새로운닉')
    await user.click(screen.getByRole('button', { name: '저장' }))
    await waitFor(() => expect(spy).toHaveBeenCalledWith('새로운닉'))
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false))
  })
})
