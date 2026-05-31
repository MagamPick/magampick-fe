import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { BusinessHourEditSheet } from './BusinessHourEditSheet'
import type { DayHoursForm } from '../types'

const monOpen: DayHoursForm = { day: 'mon', closed: false, openTime: '09:00', closeTime: '21:00' }

describe('BusinessHourEditSheet — 요일 영업시간 편집 시트', () => {
  it('대상 요일 제목과 현재 시각(HH:MM)을 표시', () => {
    render(<BusinessHourEditSheet open day={monOpen} onOpenChange={() => {}} onSave={() => {}} />)
    expect(screen.getByText('월요일 영업시간')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '오픈 시각' })).toHaveTextContent('09:00')
    expect(screen.getByRole('button', { name: '마감 시각' })).toHaveTextContent('21:00')
  })

  it('휴무로 설정하면 시각 선택이 비활성화', async () => {
    render(<BusinessHourEditSheet open day={monOpen} onOpenChange={() => {}} onSave={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: '이 요일 휴무로 설정' }))
    expect(screen.getByRole('button', { name: '오픈 시각' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '휴무 해제' })).toBeInTheDocument()
  })

  it('마감이 오픈보다 이르면 저장 거부 + 에러 표시', async () => {
    const onSave = vi.fn()
    render(<BusinessHourEditSheet open day={monOpen} onOpenChange={() => {}} onSave={onSave} />)
    await userEvent.click(screen.getByRole('button', { name: '마감 시각' }))
    await userEvent.click(within(screen.getByRole('listbox', { name: '시' })).getByRole('option', { name: '08' }))
    await userEvent.click(screen.getByRole('button', { name: '저장' }))
    expect(screen.getByRole('alert')).toHaveTextContent('마감 시간은 오픈 시간 이후')
    expect(onSave).not.toHaveBeenCalled()
  })

  it('유효한 시각이면 onSave 로 값 전달', async () => {
    const onSave = vi.fn()
    render(<BusinessHourEditSheet open day={monOpen} onOpenChange={() => {}} onSave={onSave} />)
    await userEvent.click(screen.getByRole('button', { name: '마감 시각' }))
    await userEvent.click(within(screen.getByRole('listbox', { name: '시' })).getByRole('option', { name: '22' }))
    await userEvent.click(screen.getByRole('button', { name: '저장' }))
    expect(onSave).toHaveBeenCalledWith({
      day: 'mon',
      closed: false,
      openTime: '09:00',
      closeTime: '22:00',
    })
  })

  it('휴무로 저장하면 closed=true 로 전달', async () => {
    const onSave = vi.fn()
    render(<BusinessHourEditSheet open day={monOpen} onOpenChange={() => {}} onSave={onSave} />)
    await userEvent.click(screen.getByRole('button', { name: '이 요일 휴무로 설정' }))
    await userEvent.click(screen.getByRole('button', { name: '저장' }))
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ day: 'mon', closed: true }))
  })
})
