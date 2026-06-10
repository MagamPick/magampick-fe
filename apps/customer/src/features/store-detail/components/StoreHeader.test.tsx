import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StoreHero } from './StoreHero'
import { StoreHeadMeta } from './StoreHeadMeta'
import { StoreActions } from './StoreActions'
import type { StoreDetail } from '../types'

const STORE: StoreDetail = {
  id: 1,
  name: '베이커리 브레드샵',
  imageUrl: null,
  businessStatus: 'OPEN',
  closingTime: '21:00',
  rating: 4.8,
  reviewCount: 412,
  distanceKm: 0.3,
  isFavorite: false,
  address: '서울 마포구 서교동 123-45',
  phone: '02-1234-5678',
  businessNumber: '123-45-67890',
  operatingHours: [],
  lat: 37.55,
  lng: 126.92,
}

describe('StoreHero', () => {
  it('단골_상태_반영_그리고_토글_호출', async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()
    render(
      <StoreHero
        imageUrl={null}
        isFavorite
        onBack={vi.fn()}
        onShare={vi.fn()}
        onToggleFavorite={onToggle}
      />,
    )
    const favButton = screen.getByRole('button', { name: '단골 해제' })
    expect(favButton).toHaveAttribute('aria-pressed', 'true')
    await user.click(favButton)
    expect(onToggle).toHaveBeenCalled()
  })
})

describe('StoreHeadMeta', () => {
  it('이름_영업상태_마감_평점_거리', () => {
    render(<StoreHeadMeta store={STORE} />)
    expect(screen.getByText('베이커리 브레드샵')).toBeInTheDocument()
    expect(screen.getByText('영업중')).toBeInTheDocument()
    expect(screen.getByText('21:00 마감')).toBeInTheDocument()
    expect(screen.getByText('★ 4.8 (412)')).toBeInTheDocument()
    expect(screen.getByText('0.3km')).toBeInTheDocument()
  })

  it('영업외_상태_라벨_노출', () => {
    render(<StoreHeadMeta store={{ ...STORE, businessStatus: 'CLOSED_TODAY' }} />)
    expect(screen.getByText('오늘 영업 종료')).toBeInTheDocument()
  })

  it('closingTime_null이면_마감_미노출', () => {
    render(<StoreHeadMeta store={{ ...STORE, closingTime: null }} />)
    expect(screen.queryByText(/마감/)).toBeNull()
    // 다른 메타는 그대로 노출
    expect(screen.getByText('★ 4.8 (412)')).toBeInTheDocument()
  })
})

describe('StoreActions', () => {
  it('전화_tel링크_지도_공유_핸들러', async () => {
    const user = userEvent.setup()
    const onMap = vi.fn()
    const onShare = vi.fn()
    render(<StoreActions phone="02-1234-5678" onMap={onMap} onShare={onShare} />)

    expect(screen.getByRole('link', { name: /전화/ })).toHaveAttribute('href', 'tel:02-1234-5678')
    await user.click(screen.getByRole('button', { name: '지도' }))
    expect(onMap).toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: '공유' }))
    expect(onShare).toHaveBeenCalled()
  })
})
