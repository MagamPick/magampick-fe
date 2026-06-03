import { describe, expect, it } from 'vitest'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { render, screen } from '@testing-library/react'
import { TabLayout } from './TabLayout'

describe('TabLayout', () => {
  it('플로팅_바텀네비_뒤_화면_배경을_bg_card로_유지', () => {
    const router = createMemoryRouter([
      {
        element: <TabLayout />,
        children: [{ index: true, element: <div>탭 본문</div> }],
      },
    ])

    render(<RouterProvider router={router} />)

    const main = screen.getByText('탭 본문').parentElement
    const layout = main?.parentElement

    expect(layout).toHaveClass('mx-auto', 'max-w-md', 'bg-card')
    expect(layout).not.toHaveClass('bg-background')
    expect(main).toHaveClass('bg-card')
  })
})
