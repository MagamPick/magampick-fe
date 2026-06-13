import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createQueryWrapper } from '@/shared/test/queryWrapper'
import { useProcessSettlement } from './useProcessSettlement'
import { useSetSmsMock } from './useSetSmsMock'
import { opsApi } from '../api/opsApi'

vi.mock('../api/opsApi')

beforeEach(() => vi.clearAllMocks())

describe('useProcessSettlement', () => {
  it('targetDate 로 정산 처리 호출하고 결과(processedCount)를 노출', async () => {
    vi.mocked(opsApi.processSettlement).mockResolvedValue({ processedCount: 3 })
    const { result } = renderHook(() => useProcessSettlement(), { wrapper: createQueryWrapper() })

    result.current.mutate('2026-06-13')

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(opsApi.processSettlement).toHaveBeenCalledWith('2026-06-13')
    expect(result.current.data?.processedCount).toBe(3)
  })

  it('인자 없이(undefined) 호출하면 서버가 오늘로 처리', async () => {
    vi.mocked(opsApi.processSettlement).mockResolvedValue({ processedCount: 0 })
    const { result } = renderHook(() => useProcessSettlement(), { wrapper: createQueryWrapper() })

    result.current.mutate(undefined)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(opsApi.processSettlement).toHaveBeenCalledWith(undefined)
  })
})

describe('useSetSmsMock', () => {
  it('enabled 값으로 SMS mock 전환을 호출', async () => {
    vi.mocked(opsApi.setSmsMock).mockResolvedValue(undefined)
    const { result } = renderHook(() => useSetSmsMock(), { wrapper: createQueryWrapper() })

    result.current.mutate(true)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(opsApi.setSmsMock).toHaveBeenCalledWith(true)
  })
})
