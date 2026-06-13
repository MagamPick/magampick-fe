import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { createQueryWrapper } from '@/shared/test/queryWrapper'
import { OpsPage } from './OpsPage'

describe('OpsPage', () => {
  it('정산 배치와 SMS mock 카드를 함께 렌더한다', () => {
    render(<OpsPage />, { wrapper: createQueryWrapper() })

    expect(screen.getByRole('button', { name: '정산 실행' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'mock으로 전환' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '실발송으로 전환' })).toBeInTheDocument()
  })
})
