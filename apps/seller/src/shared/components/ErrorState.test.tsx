import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { ErrorState } from './ErrorState'

describe('ErrorState', () => {
  it('children 없으면 기본 안내 문구를 노출', () => {
    render(<ErrorState />)
    expect(
      screen.getByText('지금은 불러오지 못했어요. 잠시 후 다시 시도해주세요.'),
    ).toBeInTheDocument()
  })

  it('children 으로 커스텀 메시지를 노출', () => {
    render(<ErrorState>주문 목록을 불러오지 못했어요.</ErrorState>)
    expect(screen.getByText('주문 목록을 불러오지 못했어요.')).toBeInTheDocument()
  })

  it('onRetry 가 있으면 다시 시도 버튼을 노출하고 클릭 시 호출', async () => {
    const onRetry = vi.fn()
    render(<ErrorState onRetry={onRetry} />)
    await userEvent.click(screen.getByRole('button', { name: '다시 시도' }))
    expect(onRetry).toHaveBeenCalledOnce()
  })

  it('onRetry 가 없으면 버튼을 렌더하지 않음', () => {
    render(<ErrorState />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
