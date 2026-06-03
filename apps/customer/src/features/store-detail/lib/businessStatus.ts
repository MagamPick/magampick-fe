import type { BusinessStatus } from '../types'

/** 영업 중일 때만 주문/장바구니 담기 가능 (영업 외 BREAK/CLOSED_TODAY 는 차단) */
export function isOrderable(status: BusinessStatus): boolean {
  return status === 'OPEN'
}

/** 메타 한 줄에 노출할 영업 상태 라벨 */
export function businessStatusLabel(status: BusinessStatus): string {
  switch (status) {
    case 'OPEN':
      return '영업중'
    case 'BREAK':
      return '브레이크타임'
    case 'CLOSED_TODAY':
      return '오늘 영업 종료'
  }
}

/** 상태별 라벨 색 (Tailwind 토큰) */
export function businessStatusTone(status: BusinessStatus): string {
  switch (status) {
    case 'OPEN':
      return 'text-success'
    case 'BREAK':
      return 'text-[#b07a00]'
    case 'CLOSED_TODAY':
      return 'text-destructive'
  }
}
