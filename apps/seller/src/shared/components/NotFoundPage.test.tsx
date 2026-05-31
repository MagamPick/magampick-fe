import { describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router'
import { render, screen } from '@testing-library/react'
import { NotFoundPage } from './NotFoundPage'

describe('NotFoundPage', () => {
  it('seller_화면_폭_규칙에_맞춰_가운데_컬럼으로_표시', () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('main')).toHaveClass('mx-auto', 'max-w-md', 'bg-card')
  })
})
