import { ApiError } from '@/shared/lib/apiError'
import { WEEKDAYS, WEEKDAY_ORDER } from '../types'
import type {
  BusinessHour,
  CreateStoreInput,
  OperationStatus,
  StoreDetail,
  StoreStatus,
  StoreSummary,
  UpdateStoreInput,
  Weekday,
} from '../types'
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
  /** 사업자번호(숫자 10자리) — per-store·UNIQUE X. mock 보관용(UI 미표시) */
  businessNumber?: string
  /** 매장 정보 수정 대상 필드 (노션: 매장 정보 수정) — 미리채움·UPDATE source */
  address: string
  addressDetail?: string
  phone: string
  /** 대표 사진 — mock 토글(실 업로드는 BE·연동). 등록/수정 폼의 photoAdded 와 매핑 */
  photoAdded: boolean
}

/** 데모 시드: 역삼점(전 요일 09:00–21:00 → OPEN·오늘 항상 영업) / 강남점(전휴무 → 항상 비활성) */
function seed(): StoreRecord[] {
  return [
    {
      id: 's1',
      name: '마감픽 베이커리 역삼점',
      operationStatus: 'OPEN',
      businessHours: WEEKDAY_ORDER.map((day) => ({ day, openTime: '09:00', closeTime: '21:00' })),
      address: '서울 강남구 역삼로 180',
      addressDetail: '1층',
      phone: '02-501-1234',
      photoAdded: true,
    },
    {
      id: 's2',
      name: '마감픽 베이커리 강남점',
      operationStatus: 'CLOSED_TODAY',
      businessHours: [],
      address: '서울 강남구 테헤란로 152',
      addressDetail: '2층 201호',
      phone: '02-555-6789',
      photoAdded: true,
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

/** 수정 폼 미리채움용 상세 매핑 (record → StoreDetail) */
function toDetail(store: StoreRecord): StoreDetail {
  return {
    id: store.id,
    storeName: store.name,
    storeAddress: store.address,
    storeAddressDetail: store.addressDetail,
    storePhone: store.phone,
    photoAdded: store.photoAdded,
  }
}

export const storeApi = {
  async getStores(): Promise<StoreSummary[]> {
    await delay(300)
    return stores.map((s) => ({ id: s.id, name: s.name, operationStatus: s.operationStatus }))
  },

  /**
   * 사업자 진위확인 — Mock(국세청 사업자등록 API 대체): 앞 3자리 000 이면 실패.
   * 진위확인 3요소(사업자번호+대표자명+개업일자) 필수. 실연동 시 국세청 API 로 교체.
   */
  async checkBusinessNumber(input: {
    businessNumber: string
    representativeName: string
    openDate: string
  }): Promise<{ verified: true }> {
    await delay(600)
    const digits = input.businessNumber.replace(/\D/g, '')
    if (digits.length !== 10 || !input.representativeName.trim() || !input.openDate) {
      throw new ApiError(400, 'INVALID_INPUT', '사업자번호·대표자명·개업일자를 모두 입력해주세요')
    }
    if (digits.slice(0, 3) === '000') {
      throw new ApiError(404, 'BUSINESS_NUMBER_INVALID', '조회되지 않는 사업자등록번호입니다')
    }
    return { verified: true }
  },

  /**
   * 매장 등록 (경로 B) — 자동 승인. 외부 검증·지오코딩·사진 업로드는 트랜잭션 전 처리됐다고 가정(mock).
   * 좌표·사진은 mock 생략. 중복 사업자번호 허용(UNIQUE X). 초기값: operation_status CLOSED_TODAY, 영업시간 0개.
   */
  async createStore(input: CreateStoreInput): Promise<StoreSummary> {
    await delay(700)
    const digits = input.businessNumber.replace(/\D/g, '')
    if (digits.length !== 10) {
      throw new ApiError(
        422,
        'BUSINESS_NUMBER_FORMAT_INVALID',
        '사업자등록번호 형식이 올바르지 않습니다',
      )
    }
    const record: StoreRecord = {
      id: `s${stores.length + 1}`,
      name: input.storeName,
      operationStatus: 'CLOSED_TODAY',
      businessHours: [],
      businessNumber: digits,
      address: input.storeAddress,
      addressDetail: input.storeAddressDetail?.trim() || undefined,
      phone: input.storePhone,
      photoAdded: Boolean(input.photoAdded),
    }
    stores.push(record)
    return { id: record.id, name: record.name, operationStatus: record.operationStatus }
  },

  /** 매장 상세 — 수정 폼 미리채움 source (5필드 + id) */
  async getStore(storeId: string): Promise<StoreDetail> {
    await delay(300)
    return toDetail(find(storeId))
  },

  /**
   * 매장 정보 수정 — 5필드(매장명·주소·상세·전화·사진) 즉시 반영(자동 승인, 재승인 X).
   * 변경 필드 외부 호출(주소→지오코딩 / 사진→OCI)·권한(STORE_NOT_OWNED/UNAUTHORIZED)은
   * BE·연동 소관(mock 생략) — 등록/영업시간 mock 과 동일 방침.
   */
  async updateStore(input: UpdateStoreInput): Promise<StoreDetail> {
    await delay(500)
    const store = find(input.storeId)
    store.name = input.storeName
    store.address = input.storeAddress
    store.addressDetail = input.storeAddressDetail?.trim() || undefined
    store.phone = input.storePhone
    store.photoAdded = Boolean(input.photoAdded)
    return toDetail(store)
  },

  async getStoreStatus(storeId: string): Promise<StoreStatus> {
    await delay(300)
    return toStatus(find(storeId))
  },

  async transitionStatus(input: { storeId: string; to: OperationStatus }): Promise<StoreStatus> {
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
