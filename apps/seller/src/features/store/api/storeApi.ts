/**
 * 매장 도메인 API — 연동 현황:
 *   실연동(Step 1): getStores / getStoreStatus / transitionStatus / getBusinessHours / saveBusinessHours
 *   Mock 유지(Step 2): createStore / checkBusinessNumber / getStore / updateStore
 *
 * 실연동 함수: apiClient + Zod 응답 검증 → FE 도메인 타입 매핑 (api-client-convention §3)
 * Step 2 mock: in-memory 상태 유지 (multipart 사진·Daum 주소 위젯 연동 미완)
 */
import { z } from 'zod'
import { apiClient } from '@/shared/lib/axios'
import { ApiError } from '@/shared/lib/apiError'
import { WEEKDAY_ORDER } from '../types'
import { operationStatusSchema } from '../types'
import { WEEKDAY_TO_BE, BE_TO_WEEKDAY } from '../lib/dayMapping'
import type {
  BusinessHour,
  CreateStoreInput,
  OperationStatus,
  StoreDetail,
  StoreStatus,
  StoreSummary,
  UpdateStoreInput,
} from '../types'

// ─── BE 응답 Zod 스키마 ────────────────────────────────────────────────────────
// api-types/seller.ts 생성 형태 미러. SpringDoc 특성상 optional 생성이나
// FE 비즈니스 필수 필드는 runtime required 로 tighten.

/** StoreResponse (L1627) — 보유 매장 목록 항목 */
const storeResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  operationStatus: operationStatusSchema,
})
const storeResponsesSchema = z.array(storeResponseSchema)

/** OperationStatusResponse (L1558) — 영업 상태 + canOpenToday */
const operationStatusResponseSchema = z.object({
  storeId: z.number(),
  operationStatus: operationStatusSchema,
  canOpenToday: z.boolean(),
  todayCloseTime: z.string().optional(),
})

/** BusinessHourPayload (L776) — 요일·시각 1행 */
const beWeekdayEnum = z.enum([
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
])
const businessHourPayloadSchema = z.object({
  day: beWeekdayEnum,
  openTime: z.string(),
  closeTime: z.string(),
})
const businessHourPayloadsSchema = z.array(businessHourPayloadSchema)

// ─── BE 응답 → FE 도메인 매핑 헬퍼 ──────────────────────────────────────────

function toStoreStatus(parsed: z.infer<typeof operationStatusResponseSchema>): StoreStatus {
  return {
    storeId: parsed.storeId,
    operationStatus: parsed.operationStatus,
    canOpenToday: parsed.canOpenToday,
    // 방어적 slice: BE 예시는 HH:mm (혹시 HH:mm:ss로 오더라도 안전)
    todayCloseTime: parsed.todayCloseTime?.slice(0, 5),
  }
}

function toBusinessHour(payload: z.infer<typeof businessHourPayloadSchema>): BusinessHour {
  return {
    day: BE_TO_WEEKDAY[payload.day],
    openTime: payload.openTime.slice(0, 5),
    closeTime: payload.closeTime.slice(0, 5),
  }
}

// ─── Step 2 Mock (in-memory) ─────────────────────────────────────────────────

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

interface StoreRecord {
  id: number
  name: string
  operationStatus: OperationStatus
  businessHours: BusinessHour[]
  businessNumber?: string
  address: string
  addressDetail?: string
  phone: string
  photoAdded: boolean
}

function seed(): StoreRecord[] {
  return [
    {
      id: 1,
      name: '마감픽 베이커리 역삼점',
      operationStatus: 'OPEN',
      businessHours: WEEKDAY_ORDER.map((day) => ({ day, openTime: '09:00', closeTime: '21:00' })),
      address: '서울 강남구 역삼로 180',
      addressDetail: '1층',
      phone: '02-501-1234',
      photoAdded: true,
    },
    {
      id: 2,
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

function findMock(storeId: number): StoreRecord {
  const store = stores.find((s) => s.id === storeId)
  if (!store) throw new ApiError(404, 'STORE_NOT_FOUND', '매장을 찾을 수 없습니다')
  return store
}

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

// ─── Public API ──────────────────────────────────────────────────────────────

export const storeApi = {
  // ── A. 보유 매장 목록 (실연동) ────────────────────────────────────────────

  /** GET /seller/stores — 보유 매장 목록 (StoreResponse[]) */
  async getStores(): Promise<StoreSummary[]> {
    const res = await apiClient.get('/seller/stores')
    const parsed = storeResponsesSchema.parse(res.data)
    return parsed.map((s) => ({
      id: s.id,
      name: s.name,
      operationStatus: s.operationStatus,
    }))
  },

  // ── B. 영업 상태 관리 (실연동) ────────────────────────────────────────────

  /** GET /seller/stores/{storeId}/operation-status — 영업 상태 조회 (OperationStatusResponse) */
  async getStoreStatus(storeId: number): Promise<StoreStatus> {
    const res = await apiClient.get(`/seller/stores/${storeId}/operation-status`)
    return toStoreStatus(operationStatusResponseSchema.parse(res.data))
  },

  /**
   * PATCH /seller/stores/{storeId}/operation-status — 영업 상태 전환
   * body: OperationStatusTransitionRequest { to }
   * 에러: STORE_CLOSED_TODAY(409) · INVALID_STATE_TRANSITION(409) — BE 권위, normalizeError 가 surface
   */
  async transitionStatus(input: { storeId: number; to: OperationStatus }): Promise<StoreStatus> {
    const res = await apiClient.patch(`/seller/stores/${input.storeId}/operation-status`, {
      to: input.to,
    })
    return toStoreStatus(operationStatusResponseSchema.parse(res.data))
  },

  // ── C. 영업시간 설정 (실연동) ──────────────────────────────────────────────

  /**
   * GET /seller/stores/{storeId}/business-hours — 영업시간 조회 (BusinessHourPayload[])
   * BE 요일 MONDAY..SUNDAY → FE 요일 mon..sun (BE_TO_WEEKDAY 매핑)
   */
  async getBusinessHours(storeId: number): Promise<BusinessHour[]> {
    const res = await apiClient.get(`/seller/stores/${storeId}/business-hours`)
    const parsed = businessHourPayloadsSchema.parse(res.data)
    return parsed.map(toBusinessHour)
  },

  /**
   * PUT /seller/stores/{storeId}/business-hours — 영업시간 저장 (전체 교체)
   * body: BusinessHoursSaveRequest { hours: BusinessHourPayload[] }
   * FE 요일 mon..sun → BE 요일 MONDAY..SUNDAY (WEEKDAY_TO_BE 매핑)
   * 에러: BUSINESS_HOURS_INVALID_RANGE(400) · TODAY_BUSINESS_HOURS_LOCKED(409) — BE 권위
   */
  async saveBusinessHours(input: { storeId: number; hours: BusinessHour[] }): Promise<BusinessHour[]> {
    const beHours = input.hours.map((h) => ({
      day: WEEKDAY_TO_BE[h.day],
      openTime: h.openTime,
      closeTime: h.closeTime,
    }))
    const res = await apiClient.put(`/seller/stores/${input.storeId}/business-hours`, {
      hours: beHours,
    })
    const parsed = businessHourPayloadsSchema.parse(res.data)
    return parsed.map(toBusinessHour)
  },

  // ── D. Mock 유지 (Step 2) ──────────────────────────────────────────────────
  // Daum 위젯·사진 multipart 미연동. storeId/id는 number로 갱신 완료.

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
   * 매장 등록 (경로 B) — Step 2 Mock. 외부 검증·지오코딩·사진 업로드는 Step 2 실연동 예정.
   * 중복 사업자번호 허용(UNIQUE X). 초기값: operation_status CLOSED_TODAY, 영업시간 0개.
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
      id: stores.length + 1,
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

  /** 매장 상세 — 수정 폼 미리채움 source. Step 2 Mock. */
  async getStore(storeId: number): Promise<StoreDetail> {
    await delay(300)
    return toDetail(findMock(storeId))
  },

  /**
   * 매장 정보 수정 — Step 2 Mock. 5필드(매장명·주소·상세·전화·사진) 즉시 반영.
   * 주소→지오코딩 / 사진→OCI 실연동은 Step 2 소관.
   */
  async updateStore(input: UpdateStoreInput): Promise<StoreDetail> {
    await delay(500)
    const store = findMock(input.storeId)
    store.name = input.storeName
    store.address = input.storeAddress
    store.addressDetail = input.storeAddressDetail?.trim() || undefined
    store.phone = input.storePhone
    store.photoAdded = Boolean(input.photoAdded)
    return toDetail(store)
  },
}

