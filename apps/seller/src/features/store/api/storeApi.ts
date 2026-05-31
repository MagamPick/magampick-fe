import { ApiError } from '@/shared/lib/apiError'
import { WEEKDAYS, WEEKDAY_ORDER } from '../types'
import type { BusinessHour, OperationStatus, StoreStatus, StoreSummary, Weekday } from '../types'
import { canTransition } from '../lib/transitions'
import { hasTodayHoursChanged } from '../lib/businessHours'

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
  /** 영업시간 (영업 요일만 — 휴무 요일은 없음). businessDays·todayCloseTime 파생의 source */
  businessHours: BusinessHour[]
}

/** 데모 시드: 역삼점(전 요일 09:00–21:00 → OPEN·오늘 항상 영업) / 강남점(전휴무 → 항상 비활성) */
function seed(): StoreRecord[] {
  return [
    {
      id: 's1',
      name: '마감픽 베이커리 역삼점',
      operationStatus: 'OPEN',
      businessHours: WEEKDAY_ORDER.map((day) => ({ day, openTime: '09:00', closeTime: '21:00' })),
    },
    {
      id: 's2',
      name: '마감픽 베이커리 강남점',
      operationStatus: 'CLOSED_TODAY',
      businessHours: [],
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

/** 오늘 요일의 영업시간 row (없으면 undefined = 오늘 휴무) */
function todayHour(store: StoreRecord): BusinessHour | undefined {
  const t = todayWeekday()
  return store.businessHours.find((h) => h.day === t)
}

function toStatus(store: StoreRecord): StoreStatus {
  const th = todayHour(store)
  return {
    storeId: store.id,
    operationStatus: store.operationStatus,
    canOpenToday: Boolean(th),
    todayCloseTime: th?.closeTime,
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
    const canOpenToday = Boolean(todayHour(store))

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

  async getBusinessHours(storeId: string): Promise<BusinessHour[]> {
    await delay(300)
    return find(storeId).businessHours.map((h) => ({ ...h }))
  },

  async saveBusinessHours(input: {
    storeId: string
    hours: BusinessHour[]
  }): Promise<BusinessHour[]> {
    await delay(400)
    const store = find(input.storeId)
    const { hours } = input

    // 범위 검증: 시작 < 종료 (자정 넘김 불가, == 도 거부)
    for (const h of hours) {
      if (!(h.openTime < h.closeTime)) {
        throw new ApiError(
          422,
          'BUSINESS_HOURS_INVALID_RANGE',
          '마감 시간은 오픈 시간 이후여야 해요',
        )
      }
    }

    // 영업중(OPEN) 오늘 요일 변경 제한 — 다른 요일·오늘 신규추가는 허용
    if (
      store.operationStatus === 'OPEN' &&
      hasTodayHoursChanged(store.businessHours, hours, todayWeekday())
    ) {
      throw new ApiError(
        409,
        'TODAY_BUSINESS_HOURS_LOCKED',
        '영업 중에는 오늘 영업시간을 변경할 수 없어요',
      )
    }

    // 영업 요일만, 월~일 순으로 정규화 저장 (즉시 반영)
    store.businessHours = WEEKDAY_ORDER.flatMap((day) => {
      const h = hours.find((x) => x.day === day)
      return h ? [{ day, openTime: h.openTime, closeTime: h.closeTime }] : []
    })
    return store.businessHours.map((h) => ({ ...h }))
  },
}
