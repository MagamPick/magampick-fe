import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AutocompleteDropdown } from './AutocompleteDropdown'

describe('AutocompleteDropdown', () => {
  it('제안_없으면_아무것도_안_보임', () => {
    const { container } = render(<AutocompleteDropdown suggestions={[]} onSelect={() => {}} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('매장·상품_아이콘으로_구분', () => {
    render(
      <AutocompleteDropdown
        suggestions={[
          { kind: 'store', text: '베이커리 브레드샵' },
          { kind: 'product', text: '플레인 베이글' },
        ]}
        onSelect={() => {}}
      />,
    )
    expect(screen.getByText('베이커리 브레드샵')).toBeInTheDocument()
    expect(screen.getByText('플레인 베이글')).toBeInTheDocument()
    expect(screen.getByLabelText('매장')).toBeInTheDocument()
    expect(screen.getByLabelText('상품')).toBeInTheDocument()
  })

  it('제안_탭하면_그_텍스트로_onSelect', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(
      <AutocompleteDropdown
        suggestions={[{ kind: 'product', text: '크루아상' }]}
        onSelect={onSelect}
      />,
    )
    await user.click(screen.getByRole('button', { name: /크루아상/ }))
    expect(onSelect).toHaveBeenCalledWith('크루아상')
  })
})
