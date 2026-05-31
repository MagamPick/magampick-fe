import { ApiError } from '@/shared/lib/apiError'
import { WEEKDAYS } from '../types'
import type { OperationStatus, StoreStatus, StoreSummary, Weekday } from '../types'
import { canTransition } from '../lib/transitions'

/**
 * ⚠️ Mock 스텁 — 매장 영업 상태 BE(BE 완료 NO) 미구현. in-memory 로 상태 유지.
 * 실연동 시 `apiClient` 호출 + Zod 응답 검증으로 교체 (api-client-convention).
 * 권한(STORE_NOT_OWNED/UNAUTHORIZED)은 BE/연동 책임 — mock 은 단일 사장 가정.
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

interface StoreRecord {
  id: string
  name: string
  operationStatus: OperationStatus
  /** 영업 요일 (요일 코드). 0개면 매일 휴무 → 항상 비활성 */
  businessDays: Weekday[]
  /** 오늘 마감 시각 (HH:MM) — OPEN 라벨용 */
  todayCloseTime?: string
}

/** 데모 시드: 역삼점(영업요일 전체 → OPEN 가능) / 강남점(영업요일 0개 → 항상 휴무) */
function seed(): StoreRecord[] {
  return [
    {
      id: 's1',
      name: '마감픽 베이커리 역삼점',
      operationStatus: 'OPEN',
      businessDays: [...WEEKDAYS],
      todayCloseTime: '21:00',
    },
    {
      id: 's2',
      name: '마감픽 베이커리 강남점',
      operationStatus: 'CLOSED_TODAY',
      businessDays: [],
    },
  ]
}

let stores: StoreRecord[] = seed()

/** 테스트 전용 — 모듈 in-memory 상태 초기화 */
export function resetStoreState() {
  stores = seed()
}

function todayWeekday(): Weekday {
  return WEEKDAYS[new Date().getDay()]
}

function find(storeId: string): StoreRecord {
  const store = stores.find((s) => s.id === storeId)
  if (!store) throw new ApiError(404, 'STORE_NOT_FOUND', '매장을 찾을 수 없습니다')
  return store
}

function toStatus(store: StoreRecord): StoreStatus {
  return {
    storeId: store.id,
    operationStatus: store.operationStatus,
    canOpenToday: store.businessDays.includes(todayWeekday()),
    todayCloseTime: store.todayCloseTime,
  }
}

export const storeApi = {
  async getStores(): Promise<StoreSummary[]> {
    await delay(300)
    return stores.map((s) => ({ id: s.id, name: s.name }))
  },

  async getStoreStatus(storeId: string): Promise<StoreStatus> {
    await delay(300)
    return toStatus(find(storeId))
  },

  async transitionStatus(input: {
    storeId: string
    to: OperationStatus
  }): Promise<StoreStatus> {
    await delay(400)
    const store = find(input.storeId)
    const from = store.operationStatus
    const { to } = input
    const canOpenToday = store.businessDays.includes(todayWeekday())

    // OPEN 진입 가능한 상태(CLOSED_TODAY/BREAK)인데 오늘이 휴무 → 영업 요일 조건 위반
    if (to === 'OPEN' && (from === 'CLOSED_TODAY' || from === 'BREAK') && !canOpenToday) {
      throw new ApiError(409, 'STORE_CLOSED_TODAY', '오늘은 영업 요일이 아니에요')
    }
    if (!canTransition(from, to, canOpenToday)) {
      throw new ApiError(409, 'INVALID_STATE_TRANSITION', '지금은 전환할 수 없는 상태예요')
    }

    store.operationStatus = to
    return toStatus(store)
  },
}
