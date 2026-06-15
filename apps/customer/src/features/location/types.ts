import { z } from 'zod'

/**
 * 현재 위치 보고 (소비자) — PUT /api/v1/customers/me/location.
 * 포그라운드 진입 1회 + 5분 주기로 최근 GPS 좌표를 BE 에 보고한다.
 * → 알림 타겟 "현재 위치 3km"(주변 떨이 등록·마감 임박) 의 데이터 소스.
 * BE 가 매 호출을 "마지막 좌표" 전체 교체로 다루므로 멱등 → PUT.
 */

/** 요청 — 위경도. BE 검증: NotNull + 범위(±90 / ±180). FE 도 전송 전 동일 검증 */
export const locationUpdateRequestSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
})
export type LocationUpdateRequest = z.infer<typeof locationUpdateRequestSchema>

/** 응답 — 저장된 좌표 + 갱신 시각(ISO). locationUpdatedAt 은 현재 FE 미사용(BE staleness 판단용)이나 검증만 */
export const locationUpdateResponseSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  locationUpdatedAt: z.string(),
})
export type LocationUpdateResponse = z.infer<typeof locationUpdateResponseSchema>
