import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { describe, it, expect, vi, beforeEach } from 'vitest'

const createMutate = vi.fn()
const updateMutate = vi.fn()
vi.mock('../hooks/useCreateProduct', () => ({
  useCreateProduct: () => ({ mutate: createMutate, isPending: false, error: null }),
}))
vi.mock('../hooks/useUpdateProduct', () => ({
  useUpdateProduct: () => ({ mutate: updateMutate, isPending: false, error: null }),
}))

import { ProductForm } from './ProductForm'
import type { Product } from '../types'

function renderForm(props?: Parameters<typeof ProductForm>[0]) {
  return render(
    <MemoryRouter>
      <ProductForm {...props} />
    </MemoryRouter>,
  )
}

const product: Product = {
  id: 1,
  storeId: 1,
  name: '통밀 식빵',
  category: 'BAKERY',
  price: 4800,
  onSale: true,
}

describe('ProductForm — 등록', () => {
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

    await waitFor(() => expect(createMutate).toHaveBeenCalledTimes(1))
    expect(createMutate.mock.calls[0][0]).toMatchObject({
      name: '녹차 라떼',
      category: 'BEVERAGE',
      price: 5000,
      onSale: true,
    })
  })
})

describe('ProductForm — 수정', () => {
  beforeEach(() => vi.clearAllMocks())

  it('기존 값으로 프리필되고 변경 저장 버튼을 보여준다', async () => {
    renderForm({ mode: 'edit', product })
    expect(screen.getByDisplayValue('통밀 식빵')).toBeInTheDocument()
    expect(screen.getByDisplayValue('4800')).toBeInTheDocument()
    const submit = screen.getByRole('button', { name: '변경 저장' })
    await waitFor(() => expect(submit).toBeEnabled())
  })

  it('값을 바꿔 저장하면 updateProduct 가 숫자 가격으로 호출된다', async () => {
    const user = userEvent.setup()
    renderForm({ mode: 'edit', product })

    const price = screen.getByLabelText(/정상가/)
    await user.clear(price)
    await user.type(price, '5200')

    const submit = screen.getByRole('button', { name: '변경 저장' })
    await waitFor(() => expect(submit).toBeEnabled())
    await user.click(submit)

    await waitFor(() => expect(updateMutate).toHaveBeenCalledTimes(1))
    expect(updateMutate.mock.calls[0][0]).toMatchObject({ name: '통밀 식빵', price: 5200 })
  })
})
