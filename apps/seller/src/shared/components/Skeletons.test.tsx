import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Skeleton } from './ui/skeleton'
import { ListRowSkeleton, CardSkeleton } from './Skeletons'

describe('Skeleton', () => {
  it('기본 pulse 토큰 클래스와 추가 className 을 병합', () => {
    const { container } = render(<Skeleton className="h-4 w-10" />)
    const el = container.querySelector('[data-slot="skeleton"]')
    expect(el).toBeInTheDocument()
    expect(el).toHaveClass('animate-pulse', 'bg-muted', 'h-4', 'w-10')
  })
})

describe('ListRowSkeleton', () => {
  it('기본 3행을 렌더', () => {
    const { container } = render(<ListRowSkeleton />)
    expect(container.querySelectorAll('[data-slot="skeleton-row"]')).toHaveLength(3)
  })

  it('count 만큼 행을 렌더', () => {
    const { container } = render(<ListRowSkeleton count={5} />)
    expect(container.querySelectorAll('[data-slot="skeleton-row"]')).toHaveLength(5)
  })

  it('장식 요소라 컨테이너에 aria-hidden', () => {
    const { container } = render(<ListRowSkeleton />)
    expect(container.firstChild).toHaveAttribute('aria-hidden')
  })

  it('media=false 면 썸네일 자리를 생략', () => {
    const withMedia = render(<ListRowSkeleton count={1} media />).container
    const noMedia = render(<ListRowSkeleton count={1} media={false} />).container
    expect(withMedia.querySelectorAll('[data-slot="skeleton-thumb"]')).toHaveLength(1)
    expect(noMedia.querySelectorAll('[data-slot="skeleton-thumb"]')).toHaveLength(0)
  })
})

describe('CardSkeleton', () => {
  it('count 만큼 카드를 렌더', () => {
    const { container } = render(<CardSkeleton count={4} />)
    expect(container.querySelectorAll('[data-slot="skeleton-card"]')).toHaveLength(4)
  })

  it('장식 요소라 컨테이너에 aria-hidden', () => {
    const { container } = render(<CardSkeleton />)
    expect(container.firstChild).toHaveAttribute('aria-hidden')
  })
})
