import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import type { ReactNode } from 'react'
import { renderHook, waitFor, cleanup } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { addressKeys } from './addressQueryKeys'
import { useAddresses } from './useAddresses'
import { useCreateAddress } from './useCreateAddress'
import { useUpdateAddress } from './useUpdateAddress'
import { useDeleteAddress } from './useDeleteAddress'
import { useSetDefaultAddress } from './useSetDefaultAddress'
import { useReverseGeocode } from './useReverseGeocode'

// addressesApi 전체 mock — 실 BE 호출 없이 훅 동작 검증
vi.mock('../api/addressesApi', () => ({
  addressesApi: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    setDefault: vi.fn(),
    reverseGeocode: vi.fn(),
  },
}))

import { addressesApi } from '../api/addressesApi'

/** 테스트용 정규화된 Address 픽처 (id: number, detailAddress: string) */
const mockAddress = {
  id: 1,
  label: '우리집',
  roadAddress: '서울 마포구 양화로 23',
  detailAddress: '101동 1203호',
  latitude: 37.556,
  longitude: 126.923,
  isDefault: true,
}

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

describe('addresses hooks', () => {
  beforeEach(() => vi.clearAllMocks())
  afterEach(() => cleanup())

  it('useAddresses — 목록을 불러온다 (id: number)', async () => {
    vi.mocked(addressesApi.list).mockResolvedValue([mockAddress])
    const { wrapper } = setup()
    const { result } = renderHook(() => useAddresses(), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(1)
    expect(result.current.data![0].id).toBe(1)
    expect(typeof result.current.data![0].id).toBe('number')
  })

  it('useCreateAddress — 성공 시 addresses 무효화', async () => {
    vi.mocked(addressesApi.create).mockResolvedValue({ ...mockAddress, isDefault: false, id: 2 })
    const { wrapper, invalidate } = setup()
    const { result } = renderHook(() => useCreateAddress(), { wrapper })
    result.current.mutate({
      label: '새집',
      roadAddress: '서울 마포구 와우산로 94',
      sigunguCode: '11440',
      roadnameCode: '114403003003',
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(invalidate).toHaveBeenCalledWith({ queryKey: addressKeys.all })
  })

  it('useUpdateAddress — id:number 로 호출, 성공 시 addresses 무효화', async () => {
    vi.mocked(addressesApi.update).mockResolvedValue({ ...mockAddress, label: '직장' })
    const { wrapper, invalidate } = setup()
    const { result } = renderHook(() => useUpdateAddress(), { wrapper })
    result.current.mutate({ id: 1, input: { label: '직장', detailAddress: '9층' } })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(addressesApi.update).toHaveBeenCalledWith(1, { label: '직장', detailAddress: '9층' })
    expect(invalidate).toHaveBeenCalledWith({ queryKey: addressKeys.all })
  })

  it('useDeleteAddress — id:number 로 호출, 성공 시 addresses 무효화', async () => {
    vi.mocked(addressesApi.remove).mockResolvedValue(undefined)
    const { wrapper, invalidate } = setup()
    const { result } = renderHook(() => useDeleteAddress(), { wrapper })
    result.current.mutate(2)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(addressesApi.remove).toHaveBeenCalledWith(2)
    expect(invalidate).toHaveBeenCalledWith({ queryKey: addressKeys.all })
  })

  it('useSetDefaultAddress — POST default, 성공 시 addresses 무효화', async () => {
    vi.mocked(addressesApi.setDefault).mockResolvedValue(undefined)
    const { wrapper, invalidate } = setup()
    const { result } = renderHook(() => useSetDefaultAddress(), { wrapper })
    result.current.mutate(2)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(addressesApi.setDefault).toHaveBeenCalledWith(2)
    expect(invalidate).toHaveBeenCalledWith({ queryKey: addressKeys.all })
  })

  describe('useReverseGeocode', () => {
    beforeEach(() => {
      // jsdom 은 geolocation 미제공 → 직접 주입
      Object.defineProperty(navigator, 'geolocation', {
        value: { getCurrentPosition: vi.fn() },
        configurable: true,
        writable: true,
      })
    })

    it('geolocation 성공 → reverseGeocode API 호출 → roadAddress + 입력 좌표(lat/lng) 보존', async () => {
      const mockPosition = {
        coords: { latitude: 37.5571, longitude: 126.925 },
      } as GeolocationPosition
      vi.mocked(navigator.geolocation.getCurrentPosition).mockImplementation((success) => {
        success(mockPosition)
      })
      vi.mocked(addressesApi.reverseGeocode).mockResolvedValue({
        roadAddress: '서울 마포구 양화로 45',
      })

      const { wrapper } = setup()
      const { result } = renderHook(() => useReverseGeocode(), { wrapper })
      result.current.mutate()
      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(addressesApi.reverseGeocode).toHaveBeenCalledWith({
        latitude: 37.5571,
        longitude: 126.925,
      })
      // X3: GPS 좌표를 결과에 보존해 하류(폼)로 전달 — BE 에 raw 좌표로 저장
      expect(result.current.data).toEqual({
        roadAddress: '서울 마포구 양화로 45',
        latitude: 37.5571,
        longitude: 126.925,
      })
    })

    it('geolocation 권한 거부(code:1) 시 에러 메시지 포함 reject', async () => {
      const permissionError: GeolocationPositionError = {
        code: 1,
        message: 'PERMISSION_DENIED',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
      }
      vi.mocked(navigator.geolocation.getCurrentPosition).mockImplementation((_, error) => {
        error?.(permissionError)
      })

      const { wrapper } = setup()
      const { result } = renderHook(() => useReverseGeocode(), { wrapper })
      result.current.mutate()
      await waitFor(() => expect(result.current.isError).toBe(true))
      expect(result.current.error?.message).toContain('거부')
    })

    it('reverseGeocode API 실패 시 에러 전파', async () => {
      const mockPosition = {
        coords: { latitude: 37.5571, longitude: 126.925 },
      } as GeolocationPosition
      vi.mocked(navigator.geolocation.getCurrentPosition).mockImplementation((success) => {
        success(mockPosition)
      })
      vi.mocked(addressesApi.reverseGeocode).mockRejectedValue(new Error('역지오코딩 실패'))

      const { wrapper } = setup()
      const { result } = renderHook(() => useReverseGeocode(), { wrapper })
      result.current.mutate()
      await waitFor(() => expect(result.current.isError).toBe(true))
      expect(result.current.error?.message).toContain('역지오코딩')
    })
  })
})
