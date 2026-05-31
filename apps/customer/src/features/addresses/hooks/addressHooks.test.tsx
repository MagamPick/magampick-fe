import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import type { ReactNode } from 'react'
import { renderHook, waitFor, cleanup } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { addressKeys } from './addressQueryKeys'
import { useAddresses } from './useAddresses'
import { useAddressSearch } from './useAddressSearch'
import { useCreateAddress } from './useCreateAddress'
import { useUpdateAddress } from './useUpdateAddress'
import { useDeleteAddress } from './useDeleteAddress'
import { useSetDefaultAddress } from './useSetDefaultAddress'
import { __resetAddressesStoreForTest } from '../api/addressesApi'

function setup() {
  const qc = new QueryClient({
    // gcTime 0 + unmount(cleanup) → 쿼리 캐시 gc 타이머가 안 남아 vitest 워커가 깔끔히 종료
    defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false } },
  })
  const invalidate = vi.spyOn(qc, 'invalidateQueries')
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  )
  return { invalidate, wrapper }
}

const newInput = {
  roadAddress: '서울 마포구 와우산로 94',
  latitude: 37.5512,
  longitude: 126.9246,
  label: '새집',
  detail: '202호',
}

describe('addresses hooks', () => {
  beforeEach(() => __resetAddressesStoreForTest())
  afterEach(() => cleanup())

  it('useAddresses — 목록을 불러온다', async () => {
    const { wrapper } = setup()
    const { result } = renderHook(() => useAddresses(), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data!.length).toBeGreaterThanOrEqual(1)
  })

  it('useAddressSearch — 검색어가 있을 때 결과를 불러온다', async () => {
    const { wrapper } = setup()
    const { result } = renderHook(() => useAddressSearch('마포'), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data!.length).toBeGreaterThan(0)
  })

  it('useCreateAddress — 성공 시 addresses 무효화', async () => {
    const { wrapper, invalidate } = setup()
    const { result } = renderHook(() => useCreateAddress(), { wrapper })
    result.current.mutate(newInput)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(invalidate).toHaveBeenCalledWith({ queryKey: addressKeys.all })
  })

  it('useUpdateAddress — 성공 시 addresses 무효화', async () => {
    const { wrapper, invalidate } = setup()
    const { result } = renderHook(() => useUpdateAddress(), { wrapper })
    result.current.mutate({
      id: 'ad2',
      input: {
        roadAddress: '서울 강남구 테헤란로 152',
        latitude: 37.5006,
        longitude: 127.0366,
        label: '직장',
        detail: '9층',
      },
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(invalidate).toHaveBeenCalledWith({ queryKey: addressKeys.all })
  })

  it('useDeleteAddress — 성공 시 addresses 무효화', async () => {
    const { wrapper, invalidate } = setup()
    const { result } = renderHook(() => useDeleteAddress(), { wrapper })
    result.current.mutate('ad2') // 기본이 아닌 시드 주소
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(invalidate).toHaveBeenCalledWith({ queryKey: addressKeys.all })
  })

  it('useSetDefaultAddress — 성공 시 addresses 무효화', async () => {
    const { wrapper, invalidate } = setup()
    const { result } = renderHook(() => useSetDefaultAddress(), { wrapper })
    result.current.mutate('ad2')
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(invalidate).toHaveBeenCalledWith({ queryKey: addressKeys.all })
  })
})
