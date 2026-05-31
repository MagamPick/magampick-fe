import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ProductCard } from './ProductCard'

describe('ProductCard', () => {
  it('이름·카테고리·가격과 판매중 배지를 보여준다', () => {
    render(<ProductCard name="아메리카노" category="음료" price={3000} />)
    expect(screen.getByText('아메리카노')).toBeInTheDocument()
    expect(screen.getByText('음료')).toBeInTheDocument()
    expect(screen.getByText('₩3,000')).toBeInTheDocument()
    expect(screen.getByText('판매중')).toBeInTheDocument()
  })

  it('품절 상품은 품절 배지를 보여준다', () => {
    render(<ProductCard name="초코 머핀" category="디저트" price={3800} soldOut />)
    expect(screen.getByText('품절')).toBeInTheDocument()
  })

  it('showCategory=false 면 카드 안에 카테고리를 숨긴다 (그룹 뷰)', () => {
    render(<ProductCard name="아메리카노" category="음료" price={3000} showCategory={false} />)
    expect(screen.queryByText('음료')).not.toBeInTheDocument()
  })
})
