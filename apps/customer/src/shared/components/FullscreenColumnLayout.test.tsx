import { describe, expect, it } from 'vitest'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { render, screen } from '@testing-library/react'
import { FullscreenColumnLayout } from './FullscreenColumnLayout'

describe('FullscreenColumnLayout', () => {
  it('독립_상세_화면을_max_width_컬럼으로_제한', () => {
    const router = createMemoryRouter([
      {
        element: <FullscreenColumnLayout />,
        children: [{ path: '/', element: <div>상세 화면</div> }],
      },
    ])

    render(<RouterProvider router={router} />)

    const layout = screen.getByText('상세 화면').parentElement
    expect(layout).toHaveClass('mx-auto', 'max-w-md', 'min-h-screen', 'bg-card')
  })
})
