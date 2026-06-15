import { apiClient } from '@/shared/lib/axios'
import {
  locationUpdateRequestSchema,
  locationUpdateResponseSchema,
  type LocationUpdateRequest,
  type LocationUpdateResponse,
} from '../types'

/**
 * 현재 위치 보고 — PUT /api/v1/customers/me/location (전체 교체, 멱등).
 * apiClient 인터셉터가 envelope({success,data}) 를 자동 unwrap → res.data = DTO.
 * 알림 타겟 "현재 위치 3km" 의 데이터 소스.
 *
 * 생성 타입(@magampick/api-types)에 아직 없는 신규 EP(BE 병렬 구현 중) — 로컬 Zod 로 계약 고정.
 */
export const locationApi = {
  async updateMyLocation(body: LocationUpdateRequest): Promise<LocationUpdateResponse> {
    const payload = locationUpdateRequestSchema.parse(body)
    const res = await apiClient.put('/customers/me/location', payload)
    return locationUpdateResponseSchema.parse(res.data)
  },
}
