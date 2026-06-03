import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { InfoTab } from './InfoTab'
import type { StoreDetail } from '../types'

const STORE: StoreDetail = {
  id: 'st-1',
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
  operatingHours: [
    { day: '월', open: '08:00', close: '21:00', closed: false },
    { day: '일', open: null, close: null, closed: true },
  ],
  lat: 37.55,
  lng: 126.92,
}

describe('InfoTab', () => {
  it('주소_전화_사업자_그리고_휴무_표시', () => {
    render(<InfoTab store={STORE} />)
    expect(screen.getByText('서울 마포구 서교동 123-45')).toBeInTheDocument()
    expect(screen.getByText('123-45-67890')).toBeInTheDocument()
    expect(screen.getByText('08:00 – 21:00')).toBeInTheDocument()
    expect(screen.getByText('휴무')).toBeInTheDocument()
  })
})
