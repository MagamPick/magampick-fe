import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { KakaoMapView } from './KakaoMapView'

/**
 * KakaoMapView 는 실제 지도 렌더가 SDK(window.kakao) 의존이라 단위테스트는 "SDK 부재 시 안내" 만 검증.
 * 마커 표시·탭·내 위치·줌 등 SDK 연동 동작은 dev 서버 + Playwright 스크린샷으로 수동 확인(프로토타입 대조).
 */
describe('KakaoMapView', () => {
  it('카카오_SDK_없으면_지도_못불러옴_안내_노출', () => {
    render(
      <KakaoMapView
        stores={[]}
        center={{ latitude: 37.55, longitude: 126.92, source: 'fallback' }}
        radiusKm={3}
        selectedId={null}
        onStoreSelect={() => {}}
      />,
    )
    expect(screen.getByText('지도를 불러오지 못했어요')).toBeInTheDocument()
  })
})
