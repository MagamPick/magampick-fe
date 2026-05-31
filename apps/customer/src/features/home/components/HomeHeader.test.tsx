import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { ComingSoonProvider } from '@/shared/components/ComingSoonToast'
import { HomeHeader } from './HomeHeader'
import { useHomeAddress } from '../hooks/useHomeAddress'
import { ROUTES } from '@/shared/lib/routes'

vi.mock('../hooks/useHomeAddress')

beforeEach(() => {
  vi.mocked(useHomeAddress).mockReturnValue({
    data: { label: '서울 마포구 서교동' },
  } as unknown as ReturnType<typeof useHomeAddress>)
})

function renderHeader() {
  return render(
    <MemoryRouter>
      <ComingSoonProvider>
        <HomeHeader />
      </ComingSoonProvider>
    </MemoryRouter>,
  )
}

describe('HomeHeader', () => {
  it('기본_주소지_라벨_표시', () => {
    renderHeader()
    expect(screen.getByText('서울 마포구 서교동')).toBeInTheDocument()
  })

  it('주소칩_탭하면_주소지_화면으로_연결', () => {
    renderHeader()
    expect(screen.getByRole('link', { name: '서울 마포구 서교동' })).toHaveAttribute(
      'href',
      ROUTES.ADDRESSES,
    )
  })

  it('알림_탭하면_준비중_안내', async () => {
    const user = userEvent.setup()
    renderHeader()
    await user.click(screen.getByRole('button', { name: '알림' }))
    expect(await screen.findByText('알림은 준비 중이에요.')).toBeInTheDocument()
  })

  it('장바구니_탭하면_준비중_안내', async () => {
    const user = userEvent.setup()
    renderHeader()
    await user.click(screen.getByRole('button', { name: '장바구니' }))
    expect(await screen.findByText('장바구니는 준비 중이에요.')).toBeInTheDocument()
  })
})
