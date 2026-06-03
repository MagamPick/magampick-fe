import { describe, it, expect } from 'vitest'
import {
  statusToSegment,
  canTransition,
  timelineNodes,
  formatPlacedAt,
  formatPickup,
  ORDER_STATUS_LABEL,
  ORDER_SEGMENT_LABEL,
} from './orderStatus'

describe('statusToSegment', () => {
  it('상태를 목록 세그먼트로 매핑한다', () => {
    expect(statusToSegment('PENDING')).toBe('new')
    expect(statusToSegment('PREPARING')).toBe('prep')
    expect(statusToSegment('READY')).toBe('ready')
    expect(statusToSegment('COMPLETED')).toBe('done')
  })

  it('거절·취소·미수령은 모두 취소·환불(cancel) 세그먼트다', () => {
    expect(statusToSegment('REJECTED')).toBe('cancel')
    expect(statusToSegment('CANCELLED')).toBe('cancel')
    expect(statusToSegment('NO_SHOW')).toBe('cancel')
  })
})

describe('ORDER_STATUS_LABEL', () => {
  it('취소·환불 세그먼트 안에서 거절/취소/미수령을 구분 표기한다', () => {
    expect(ORDER_STATUS_LABEL.REJECTED).toBe('매장 거절')
    expect(ORDER_STATUS_LABEL.CANCELLED).toBe('고객 취소')
    expect(ORDER_STATUS_LABEL.NO_SHOW).toBe('미수령')
    expect(ORDER_STATUS_LABEL.PENDING).toBe('신규 주문')
  })

  it('세그먼트 탭 라벨을 제공한다', () => {
    expect(ORDER_SEGMENT_LABEL.new).toBe('신규')
    expect(ORDER_SEGMENT_LABEL.cancel).toBe('취소·환불')
  })
})

describe('canTransition', () => {
  it('사장 주도 허용 전이만 통과시킨다', () => {
    expect(canTransition('PENDING', 'PREPARING')).toBe(true) // 수락
    expect(canTransition('PENDING', 'REJECTED')).toBe(true) // 거절
    expect(canTransition('PREPARING', 'READY')).toBe(true) // 준비완료
    expect(canTransition('READY', 'COMPLETED')).toBe(true) // 수령완료
    expect(canTransition('READY', 'NO_SHOW')).toBe(true) // 미수령
  })

  it('정의되지 않은 전이는 거부한다', () => {
    expect(canTransition('PENDING', 'READY')).toBe(false) // 수락 건너뜀
    expect(canTransition('PREPARING', 'COMPLETED')).toBe(false) // 준비완료 건너뜀
    expect(canTransition('PREPARING', 'REJECTED')).toBe(false) // 수락 후 거절 불가
    expect(canTransition('COMPLETED', 'READY')).toBe(false) // 터미널에서 되돌림 불가
    expect(canTransition('READY', 'PREPARING')).toBe(false) // 역행 불가
  })
})

describe('timelineNodes', () => {
  it('진행 상태는 4노드 중 done/current/upcoming 을 계산한다', () => {
    const ready = timelineNodes('READY')
    expect(ready.map((n) => n.label)).toEqual(['주문 접수', '주문 수락', '준비 완료', '픽업 완료'])
    expect(ready.map((n) => n.state)).toEqual(['done', 'done', 'done', 'current'])
  })

  it('신규(PENDING)는 접수만 done, 다음 노드가 current 다', () => {
    expect(timelineNodes('PENDING').map((n) => n.state)).toEqual([
      'done',
      'current',
      'upcoming',
      'upcoming',
    ])
  })

  it('픽업 완료(COMPLETED)는 4노드 모두 done 이다', () => {
    expect(timelineNodes('COMPLETED').map((n) => n.state)).toEqual(['done', 'done', 'done', 'done'])
  })

  it('거절/취소/미수령은 접수 done + 종료 노드(cancelled) 2개로 표시한다', () => {
    const rejected = timelineNodes('REJECTED')
    expect(rejected).toEqual([
      { label: '주문 접수', state: 'done' },
      { label: '주문 거절', state: 'cancelled' },
    ])
    expect(timelineNodes('CANCELLED')[1]).toEqual({ label: '주문 취소', state: 'cancelled' })
    expect(timelineNodes('NO_SHOW')[1]).toEqual({ label: '미수령', state: 'cancelled' })
  })
})

describe('formatPlacedAt', () => {
  const now = new Date(2026, 5, 1, 15, 0) // 2026-06-01 15:00

  it('같은 날이면 "오늘 HH:mm" 으로 표시한다', () => {
    expect(formatPlacedAt(new Date(2026, 5, 1, 13, 5).toISOString(), now)).toBe('오늘 13:05')
  })

  it('다른 날이면 "M/D HH:mm" 으로 표시한다', () => {
    expect(formatPlacedAt(new Date(2026, 4, 19, 9, 30).toISOString(), now)).toBe('5/19 09:30')
  })
})

describe('formatPickup', () => {
  it('ASAP 은 "가능한 빨리", 슬롯은 HH:mm 그대로', () => {
    expect(formatPickup('ASAP')).toBe('가능한 빨리')
    expect(formatPickup('14:30')).toBe('14:30')
  })
})
