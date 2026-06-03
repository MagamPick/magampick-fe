import type { Pickup } from '@/features/cart/types'

/** 픽업 선택 라벨 — ASAP 은 "가능한 빨리", 슬롯은 "HH:mm" */
export const pickupLabel = (pickup: Pickup): string =>
  pickup.type === 'asap' ? '가능한 빨리' : pickup.time
