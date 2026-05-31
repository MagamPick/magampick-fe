import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { ScreenContainer } from './ScreenContainer'

describe('ScreenContainer', () => {
  afterEach(cleanup)

  it('children 을 렌더하고 bg-card(흰색)를 항상 적용한다', () => {
    render(<ScreenContainer>내용</ScreenContainer>)
    expect(screen.getByText('내용')).toHaveClass('bg-card')
  })

  it('variant 에 따라 구조 클래스를 적용한다', () => {
    const { rerender } = render(<ScreenContainer variant="tab">T</ScreenContainer>)
    expect(screen.getByText('T')).toHaveClass('flex-1', 'bg-card')

    rerender(<ScreenContainer variant="page">P</ScreenContainer>)
    expect(screen.getByText('P')).toHaveClass('max-w-md', 'mx-auto', 'bg-card')

    rerender(<ScreenContainer variant="bleed">B</ScreenContainer>)
    const bleed = screen.getByText('B')
    expect(bleed).toHaveClass('min-h-screen', 'bg-card')
    expect(bleed).not.toHaveClass('max-w-md')
  })

  it('className 을 덧붙이고 as 로 엘리먼트를 바꾼다', () => {
    render(
      <ScreenContainer as="main" className="px-5 pb-10">
        M
      </ScreenContainer>,
    )
    const el = screen.getByText('M')
    expect(el.tagName).toBe('MAIN')
    expect(el).toHaveClass('px-5', 'pb-10', 'bg-card')
  })
})
