/**
 * 매장 도메인 API — 실연동 현황 (Step 2 완료):
 *   getStores / getStoreStatus / transitionStatus / getBusinessHours / saveBusinessHours
 *   checkBusinessNumber / createStore / getStore / updateStore
 *
 * 실연동 함수: apiClient + Zod 응답 검증 → FE 도메인 타입 매핑 (api-client-convention §3)
 * checkBusinessNumber: POST /seller/stores/business-verification → 204 No Content (void)
 * createStore / updateStore: multipart/form-data (request JSON + 선택 image File)
 */
import { z } from 'zod'
import { apiClient } from '@/shared/lib/axios'
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

/**
 * StoreRegisterResponse (L864) — 매장 등록 응답.
 * storeId / operationStatus 가 SpringDoc optional 이나 FE 필수 → tighten.
 */
const storeRegisterResponseSchema = z.object({
  storeId: z.number(),
  operationStatus: operationStatusSchema,
})

/**
 * StoreDetailResponse (L1488) — 사장 매장 상세 응답.
 * id / name / roadAddress / zonecode / phone 을 FE 필수로 tighten.
 * latitude / longitude / description / createdAt 은 폼 불필요 — passthrough 로 허용.
 */
const storeDetailResponseSchema = z
  .object({
    id: z.number(),
    businessNumber: z.string().optional(),
    name: z.string(),
    roadAddress: z.string(),
    jibunAddress: z.string().optional(),
    detailAddress: z.string().optional(),
    zonecode: z.string(),
    phone: z.string(),
    imageUrl: z.string().optional(),
  })
  .passthrough()

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

function toStoreDetail(parsed: z.infer<typeof storeDetailResponseSchema>): StoreDetail {
  return {
    id: parsed.id,
    businessNumber: parsed.businessNumber,
    name: parsed.name,
    roadAddress: parsed.roadAddress,
    jibunAddress: parsed.jibunAddress,
    detailAddress: parsed.detailAddress,
    zonecode: parsed.zonecode,
    phone: parsed.phone,
    imageUrl: parsed.imageUrl,
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

  // ── D. 매장 등록·상세·수정 (실연동 — Step 2) ──────────────────────────────

  /**
   * POST /seller/stores/business-verification — 사업자 진위확인 (204 No Content → void).
   * 3요소(사업자번호·대표자명·개업일자) → 국세청 조회. 통과 시 resolve, 불일치는 BE 가 4xx 로 거부.
   * 에러코드: BUSINESS_INFO_MISMATCH / BUSINESS_NUMBER_NOT_ACTIVE / BUSINESS_NUMBER_VERIFICATION_FAILED
   */
  async checkBusinessNumber(input: {
    businessNumber: string
    representativeName: string
    openDate: string
  }): Promise<void> {
    await apiClient.post('/seller/stores/business-verification', input)
  },

  /**
   * POST /seller/stores — 매장 등록 신청 (multipart/form-data).
   * `request` JSON 파트(StoreCreateRequest) + 선택 `image` File 파트.
   * 응답: StoreRegisterResponse { storeId, operationStatus } → StoreSummary 매핑.
   * name 은 응답에 없으므로 제출한 input.name 으로 구성.
   * 에러코드: BUSINESS_NUMBER_FORMAT_INVALID / ADDRESS_GEOCODING_FAILED / IMAGE_UPLOAD_FAILED
   */
  async createStore(input: CreateStoreInput): Promise<StoreSummary> {
    const { imageFile, ...req } = input
    const form = new FormData()
    form.append('request', new Blob([JSON.stringify(req)], { type: 'application/json' }))
    if (imageFile) {
      form.append('image', imageFile)
    }
    const res = await apiClient.post('/seller/stores', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    const parsed = storeRegisterResponseSchema.parse(res.data)
    return {
      id: parsed.storeId,
      name: req.name ?? '',
      operationStatus: parsed.operationStatus,
    }
  },

  /**
   * GET /seller/stores/{storeId} — 매장 상세 조회 (StoreDetailResponse → StoreDetail).
   * 수정 폼 미리채움 source. 에러 시 BE 가 4xx 로 거부(STORE_NOT_OWNED 등).
   */
  async getStore(storeId: number): Promise<StoreDetail> {
    const res = await apiClient.get(`/seller/stores/${storeId}`)
    return toStoreDetail(storeDetailResponseSchema.parse(res.data))
  },

  /**
   * PATCH /seller/stores/{storeId} — 매장 정보 수정 (multipart/form-data, 부분 수정).
   * `request` JSON 파트(StoreUpdateRequest — 변경 필드만) + 선택 `image` File 파트.
   * 주소 필드(road+코드들)는 호출 측이 변경 시에만 포함 → 미포함 시 지오코딩 재호출 없음.
   * 에러코드: STORE_NOT_OWNED / ADDRESS_GEOCODING_FAILED / IMAGE_UPLOAD_FAILED
   */
  async updateStore(input: UpdateStoreInput): Promise<StoreDetail> {
    const { storeId, imageFile, ...req } = input
    const form = new FormData()
    form.append('request', new Blob([JSON.stringify(req)], { type: 'application/json' }))
    if (imageFile) {
      form.append('image', imageFile)
    }
    const res = await apiClient.patch(`/seller/stores/${storeId}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return toStoreDetail(storeDetailResponseSchema.parse(res.data))
  },
}

