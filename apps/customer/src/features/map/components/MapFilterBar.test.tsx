import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MapFilterBar } from './MapFilterBar'

describe('MapFilterBar', () => {
  it('거리_칩_3개_노출하고_현재_거리만_pressed', () => {
    render(
      <MapFilterBar distance={3} onDistanceChange={() => {}} dealsOnly onDealsOnlyChange={() => {}} />,
    )
    expect(screen.getByRole('button', { name: '1km', pressed: false })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '3km', pressed: true })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '5km', pressed: false })).toBeInTheDocument()
  })

  it('다른_거리_칩_클릭_시_onDistanceChange_호출', async () => {
    const onDistanceChange = vi.fn()
    render(
      <MapFilterBar
        distance={3}
        onDistanceChange={onDistanceChange}
        dealsOnly
        onDealsOnlyChange={() => {}}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: '1km' }))
    expect(onDistanceChange).toHaveBeenCalledWith(1)
  })

  it('마감_할인_토글_클릭_시_반전값_전달', async () => {
    const onDealsOnlyChange = vi.fn()
    render(
      <MapFilterBar
        distance={3}
        onDistanceChange={() => {}}
        dealsOnly
        onDealsOnlyChange={onDealsOnlyChange}
      />,
    )
    await userEvent.click(screen.getByRole('switch'))
    expect(onDealsOnlyChange).toHaveBeenCalledWith(false)
  })
})
