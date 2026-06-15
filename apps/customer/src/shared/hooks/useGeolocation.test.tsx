import { afterEach, describe, expect, it } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useGeolocation } from './useGeolocation'

describe('useGeolocation', () => {
  const original = Object.getOwnPropertyDescriptor(navigator, 'geolocation')

  afterEach(() => {
    if (original) Object.defineProperty(navigator, 'geolocation', original)
  })

  function stubGeolocation(impl: Geolocation['getCurrentPosition']) {
    Object.defineProperty(navigator, 'geolocation', {
      value: { getCurrentPosition: impl },
      configurable: true,
    })
  }

  it('GPS_성공_시_source_gps와_좌표_반환', async () => {
    stubGeolocation((ok) =>
      ok({ coords: { latitude: 37.1, longitude: 127.2 } } as GeolocationPosition),
    )
    const { result } = renderHook(() => useGeolocation())
    await waitFor(() => expect(result.current.isReady).toBe(true))
    expect(result.current.position).toMatchObject({
      latitude: 37.1,
      longitude: 127.2,
      source: 'gps',
    })
  })

  it('GPS_실패_시_기본주소지_fallback', async () => {
    stubGeolocation((_ok, err) => err?.({ code: 1 } as GeolocationPositionError))
    const { result } = renderHook(() => useGeolocation())
    await waitFor(() => expect(result.current.isReady).toBe(true))
    expect(result.current.position.source).toBe('fallback')
  })

  it('GPS_실패_fallback_파라미터_있으면_해당_좌표_사용', async () => {
    stubGeolocation((_ok, err) => err?.({ code: 1 } as GeolocationPositionError))
    const fallback = { latitude: 37.55, longitude: 126.92 }
    const { result } = renderHook(() => useGeolocation(fallback))
    await waitFor(() => expect(result.current.isReady).toBe(true))
    expect(result.current.position).toMatchObject({
      latitude: 37.55,
      longitude: 126.92,
      source: 'fallback',
    })
  })

  it('GPS_실패_fallback_null이면_HARDCODED_사용', async () => {
    stubGeolocation((_ok, err) => err?.({ code: 1 } as GeolocationPositionError))
    const { result } = renderHook(() => useGeolocation(null))
    await waitFor(() => expect(result.current.isReady).toBe(true))
    // HARDCODED_FALLBACK = 37.5571, 126.925
    expect(result.current.position).toMatchObject({ latitude: 37.5571, longitude: 126.925, source: 'fallback' })
  })

  it('GPS_성공_시_fallback_파라미터_무시하고_GPS_좌표_우선', async () => {
    stubGeolocation((ok) =>
      ok({ coords: { latitude: 37.1, longitude: 127.2 } } as GeolocationPosition),
    )
    const fallback = { latitude: 37.55, longitude: 126.92 }
    const { result } = renderHook(() => useGeolocation(fallback))
    await waitFor(() => expect(result.current.isReady).toBe(true))
    expect(result.current.position).toMatchObject({ latitude: 37.1, longitude: 127.2, source: 'gps' })
  })

  it('fallback_파라미터_반응형_GPS_결정_전_fallback_업데이트_반영', async () => {
    // GPS 가 늦게 응답하는 시나리오 (resolves 를 나중에 호출)
    let resolveGps: (() => void) | null = null
    stubGeolocation((_ok, err) => {
      // 타임아웃처럼 나중에 실패하도록
      resolveGps = () => err?.({ code: 1 } as GeolocationPositionError)
    })

    type FbProp = { fb: { latitude: number; longitude: number } | null }
    const { result, rerender } = renderHook(
      ({ fb }: FbProp) => useGeolocation(fb),
      { initialProps: { fb: null } as FbProp },
    )

    // GPS 결정 전 — HARDCODED fallback
    expect(result.current.position.latitude).toBe(37.5571)

    // 기본 주소 로드됨 → fallback 업데이트
    const fallback = { latitude: 37.44, longitude: 127.0 }
    rerender({ fb: fallback })

    // GPS 아직 미결, 하지만 position 은 이미 fallback 으로 스냅됨
    expect(result.current.position).toMatchObject({
      latitude: 37.44,
      longitude: 127.0,
      source: 'fallback',
    })

    // GPS 실패 처리
    await act(async () => {
      resolveGps?.()
    })
    await waitFor(() => expect(result.current.isReady).toBe(true))
    // GPS 실패 후에도 fallback 좌표 유지
    expect(result.current.position).toMatchObject({ latitude: 37.44, longitude: 127.0 })
  })
})
