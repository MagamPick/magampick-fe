import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mutate = vi.fn()
vi.mock('../hooks/useCreateProduct', () => ({
  useCreateProduct: () => ({ mutate, isPending: false, error: null }),
}))

import { ProductForm } from './ProductForm'

function renderForm() {
  return render(
    <MemoryRouter>
      <ProductForm />
    </MemoryRouter>,
  )
}

describe('ProductForm', () => {
  beforeEach(() => vi.clearAllMocks())

  it('판매 시작 토글이 기본 ON 이다', () => {
    renderForm()
    expect(screen.getByRole('switch', { name: /판매/ })).toBeChecked()
  })

  it('필수 항목을 채우기 전에는 등록 버튼이 비활성이다', () => {
    renderForm()
    expect(screen.getByRole('button', { name: '상품 등록' })).toBeDisabled()
  })

  it('카테고리 칩을 누르면 선택 상태(aria-pressed)가 된다', async () => {
    const user = userEvent.setup()
    renderForm()
    const chip = screen.getByRole('button', { name: '디저트' })
    expect(chip).toHaveAttribute('aria-pressed', 'false')
    await user.click(chip)
    expect(chip).toHaveAttribute('aria-pressed', 'true')
  })

  it('상품명·카테고리·정상가를 채우면 등록되고 가격은 숫자로 전달된다 (사진 없이도 가능)', async () => {
    const user = userEvent.setup()
    renderForm()

    await user.type(screen.getByLabelText(/상품명/), '녹차 라떼')
    await user.click(screen.getByRole('button', { name: '음료' }))
    await user.type(screen.getByLabelText(/정상가/), '5000')

    const submit = screen.getByRole('button', { name: '상품 등록' })
    await waitFor(() => expect(submit).toBeEnabled())
    await user.click(submit)

    await waitFor(() => expect(mutate).toHaveBeenCalledTimes(1))
    expect(mutate.mock.calls[0][0]).toMatchObject({
      name: '녹차 라떼',
      category: '음료',
      price: 5000,
      onSale: true,
    })
  })
})
