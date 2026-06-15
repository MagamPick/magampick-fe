import type { ReactNode } from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useCreateAnnouncement } from './useCreateAnnouncement'
import { useUpdateAnnouncement } from './useUpdateAnnouncement'
import { useDeleteAnnouncement } from './useDeleteAnnouncement'
import { announcementKeys } from './announcementKeys'
import { announcementApi } from '../api/announcementApi'
import type { AnnouncementView, AnnouncementMutationPayload } from '../types'

vi.mock('../api/announcementApi')

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  return { queryClient, wrapper }
}

const result: AnnouncementView = {
  id: 7,
  tag: 'notice',
  pinned: false,
  date: '2026-06-13',
  title: '공지',
  body: '본문',
}

const payload: AnnouncementMutationPayload = {
  tag: 'notice',
  pinned: false,
  title: '공지',
  body: '본문',
}

beforeEach(() => vi.clearAllMocks())

describe('useCreateAnnouncement', () => {
  it('성공 시 payload 로 호출하고 목록을 무효화', async () => {
    vi.mocked(announcementApi.createAnnouncement).mockResolvedValue(result)
    const { queryClient, wrapper } = setup()
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')
    const { result: hook } = renderHook(() => useCreateAnnouncement(), { wrapper })

    hook.current.mutate(payload)

    await waitFor(() => expect(hook.current.isSuccess).toBe(true))
    expect(announcementApi.createAnnouncement).toHaveBeenCalledWith(payload)
    expect(invalidate).toHaveBeenCalledWith({ queryKey: announcementKeys.list() })
  })
})

describe('useUpdateAnnouncement', () => {
  it('성공 시 id·payload 로 호출하고 목록을 무효화', async () => {
    vi.mocked(announcementApi.updateAnnouncement).mockResolvedValue(result)
    const { queryClient, wrapper } = setup()
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')
    const { result: hook } = renderHook(() => useUpdateAnnouncement(7), { wrapper })

    hook.current.mutate(payload)

    await waitFor(() => expect(hook.current.isSuccess).toBe(true))
    expect(announcementApi.updateAnnouncement).toHaveBeenCalledWith(7, payload)
    expect(invalidate).toHaveBeenCalledWith({ queryKey: announcementKeys.list() })
  })
})

describe('useDeleteAnnouncement', () => {
  it('성공 시 id 로 삭제 호출하고 목록을 무효화', async () => {
    vi.mocked(announcementApi.deleteAnnouncement).mockResolvedValue(undefined)
    const { queryClient, wrapper } = setup()
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')
    const { result: hook } = renderHook(() => useDeleteAnnouncement(3), { wrapper })

    hook.current.mutate()

    await waitFor(() => expect(hook.current.isSuccess).toBe(true))
    expect(announcementApi.deleteAnnouncement).toHaveBeenCalledWith(3)
    expect(invalidate).toHaveBeenCalledWith({ queryKey: announcementKeys.list() })
  })
})
