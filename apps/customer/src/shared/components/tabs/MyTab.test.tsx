import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { MyTab } from './MyTab'
import { ROUTES } from '@/shared/lib/routes'

describe('MyTab', () => {
  it('주소_설정_링크가_주소지_화면으로_연결', () => {
    render(
      <MemoryRouter>
        <MyTab />
      </MemoryRouter>,
    )
    const link = screen.getByRole('link', { name: '주소 설정' })
    expect(link).toHaveAttribute('href', ROUTES.ADDRESSES)
  })
})
