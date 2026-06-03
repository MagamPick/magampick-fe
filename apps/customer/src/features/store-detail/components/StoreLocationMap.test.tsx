import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StoreLocationMap } from './StoreLocationMap'

/**
 * 실제 지도 렌더는 SDK(window.kakao) 의존이라 단위테스트는 "SDK 부재 시 안내" 만 검증.
 * 내 위치·매장 마커·점선·줌·축척 동작은 dev 서버 + Playwright 스크린샷으로 수동 확인.
 */
describe('StoreLocationMap', () => {
  it('카카오_SDK_없으면_지도_못불러옴_안내_노출', () => {
    render(
      <StoreLocationMap
        lat={37.5512}
        lng={126.9201}
        name="베이커리 브레드샵"
        myPosition={{ latitude: 37.5571, longitude: 126.925, source: 'fallback' }}
      />,
    )
    expect(screen.getByText('지도를 불러오지 못했어요')).toBeInTheDocument()
  })
})
