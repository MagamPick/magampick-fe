import { afterEach, describe, expect, it } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
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
})
