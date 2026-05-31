import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ComingSoonProvider } from '@/shared/components/ComingSoonToast'
import { HomeHeader } from './HomeHeader'
import { SearchBarButton } from './SearchBarButton'
import { useHomeAddress } from '../hooks/useHomeAddress'

vi.mock('../hooks/useHomeAddress')

beforeEach(() => {
  vi.mocked(useHomeAddress).mockReturnValue({
    data: { label: '서울 마포구 서교동' },
  } as unknown as ReturnType<typeof useHomeAddress>)
})

describe('HomeHeader', () => {
  it('기본_주소지_라벨_표시', () => {
    render(
      <ComingSoonProvider>
        <HomeHeader />
      </ComingSoonProvider>,
    )
    expect(screen.getByText('서울 마포구 서교동')).toBeInTheDocument()
  })

  it('알림_탭하면_준비중_안내', async () => {
    const user = userEvent.setup()
    render(
      <ComingSoonProvider>
        <HomeHeader />
      </ComingSoonProvider>,
    )
    await user.click(screen.getByRole('button', { name: '알림' }))
    expect(await screen.findByText('알림은 준비 중이에요.')).toBeInTheDocument()
  })

  it('장바구니_탭하면_준비중_안내', async () => {
    const user = userEvent.setup()
    render(
      <ComingSoonProvider>
        <HomeHeader />
      </ComingSoonProvider>,
    )
    await user.click(screen.getByRole('button', { name: '장바구니' }))
    expect(await screen.findByText('장바구니는 준비 중이에요.')).toBeInTheDocument()
  })

  it('주소칩_탭하면_준비중_안내', async () => {
    const user = userEvent.setup()
    render(
      <ComingSoonProvider>
        <HomeHeader />
      </ComingSoonProvider>,
    )
    await user.click(screen.getByRole('button', { name: '서울 마포구 서교동' }))
    expect(await screen.findByText('주소 변경은 준비 중이에요.')).toBeInTheDocument()
  })
})

describe('SearchBarButton', () => {
  it('탭하면_검색_준비중_안내', async () => {
    const user = userEvent.setup()
    render(
      <ComingSoonProvider>
        <SearchBarButton />
      </ComingSoonProvider>,
    )
    await user.click(screen.getByRole('button', { name: /검색해 보세요/ }))
    expect(await screen.findByText('검색은 준비 중이에요.')).toBeInTheDocument()
  })
})
