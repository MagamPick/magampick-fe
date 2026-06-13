import type { ReactNode } from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useCreateEvent } from './useCreateEvent'
import { useUpdateEvent } from './useUpdateEvent'
import { useEndEvent } from './useEndEvent'
import { eventKeys } from './eventKeys'
import { eventApi } from '../api/eventApi'
import type { EventView, EventMutationPayload } from '../types'

vi.mock('../api/eventApi')

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  return { queryClient, wrapper }
}

const result: EventView = {
  id: 7,
  label: '여름 쿠폰',
  discountType: 'RATE',
  value: 10,
  minOrder: 10000,
  validUntil: '2026-07-31',
  issueLimit: 100,
  issuedCount: 0,
  active: true,
  displayStartAt: '2026-06-20',
  displayEndAt: '2026-07-20',
  status: 'scheduled',
}

const payload: EventMutationPayload = {
  label: '여름 쿠폰',
  discountType: 'RATE',
  value: 10,
  minOrder: 10000,
  validUntil: '2026-07-31',
  issueLimit: 100,
  displayStartAt: '2026-06-20',
  displayEndAt: '2026-07-20',
}

beforeEach(() => vi.clearAllMocks())

describe('useCreateEvent', () => {
  it('성공 시 payload 로 호출하고 목록을 무효화', async () => {
    vi.mocked(eventApi.createEvent).mockResolvedValue(result)
    const { queryClient, wrapper } = setup()
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')
    const { result: hook } = renderHook(() => useCreateEvent(), { wrapper })

    hook.current.mutate(payload)

    await waitFor(() => expect(hook.current.isSuccess).toBe(true))
    expect(eventApi.createEvent).toHaveBeenCalledWith(payload)
    expect(invalidate).toHaveBeenCalledWith({ queryKey: eventKeys.list() })
  })
})

describe('useUpdateEvent', () => {
  it('성공 시 id·payload 로 호출하고 목록을 무효화', async () => {
    vi.mocked(eventApi.updateEvent).mockResolvedValue(result)
    const { queryClient, wrapper } = setup()
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')
    const { result: hook } = renderHook(() => useUpdateEvent(7), { wrapper })

    hook.current.mutate(payload)

    await waitFor(() => expect(hook.current.isSuccess).toBe(true))
    expect(eventApi.updateEvent).toHaveBeenCalledWith(7, payload)
    expect(invalidate).toHaveBeenCalledWith({ queryKey: eventKeys.list() })
  })
})

describe('useEndEvent', () => {
  it('성공 시 id 로 종료 호출하고 목록을 무효화', async () => {
    vi.mocked(eventApi.endEvent).mockResolvedValue({ ...result, active: false, status: 'ended' })
    const { queryClient, wrapper } = setup()
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')
    const { result: hook } = renderHook(() => useEndEvent(7), { wrapper })

    hook.current.mutate()

    await waitFor(() => expect(hook.current.isSuccess).toBe(true))
    expect(eventApi.endEvent).toHaveBeenCalledWith(7)
    expect(invalidate).toHaveBeenCalledWith({ queryKey: eventKeys.list() })
  })
})
