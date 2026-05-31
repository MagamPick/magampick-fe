import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { BusinessHoursList } from './BusinessHoursList'
import { WEEKDAY_ORDER } from '../types'
import type { DayHoursForm } from '../types'

function makeDays(): DayHoursForm[] {
  return WEEKDAY_ORDER.map((day) => ({
    day,
    closed: day === 'sun',
    openTime: '09:00',
    closeTime: '21:00',
  }))
}

describe('BusinessHoursList — 요일별 영업시간 목록', () => {
  it('월~일 7행을 월요일 선두 순서로 렌더', () => {
    render(<BusinessHoursList days={makeDays()} today="wed" todayPersistedOpen onEditDay={() => {}} />)
    ;['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일'].forEach((l) =>
      expect(screen.getByText(l)).toBeInTheDocument(),
    )
  })

  it('영업일은 시간 범위, 휴무일은 "휴무"', () => {
    render(<BusinessHoursList days={makeDays()} today="wed" todayPersistedOpen onEditDay={() => {}} />)
    expect(screen.getAllByText('09:00 – 21:00').length).toBeGreaterThan(0)
    expect(screen.getByText('휴무')).toBeInTheDocument()
  })

  it('영업일 행을 누르면 onEditDay(index) 호출', async () => {
    const onEditDay = vi.fn()
    render(<BusinessHoursList days={makeDays()} today="wed" todayPersistedOpen onEditDay={onEditDay} />)
    await userEvent.click(screen.getByRole('button', { name: '월요일 영업시간 편집' }))
    expect(onEditDay).toHaveBeenCalledWith(0)
  })

  it('영업중(OPEN) + 오늘 요일은 잠겨서 편집 버튼이 없고 안내를 보여준다', () => {
    render(
      <BusinessHoursList
        days={makeDays()}
        today="mon"
        operationStatus="OPEN"
        todayPersistedOpen
        onEditDay={() => {}}
      />,
    )
    expect(screen.queryByRole('button', { name: '월요일 영업시간 편집' })).toBeNull()
    expect(screen.getByText('영업 중 변경 불가')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '화요일 영업시간 편집' })).toBeInTheDocument()
  })
})
