import { act, render, screen } from '@testing-library/react'
import { OfflineBanner } from './OfflineBanner'

describe('OfflineBanner', () => {
  afterEach(() => {
    act(() => window.dispatchEvent(new Event('online')))
  })

  it('온라인이면 아무것도 렌더하지 않는다', () => {
    render(<OfflineBanner />)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('오프라인이 되면 안내 배너를 보여준다', () => {
    render(<OfflineBanner />)
    act(() => window.dispatchEvent(new Event('offline')))
    expect(screen.getByRole('status')).toHaveTextContent('오프라인')
  })
})
