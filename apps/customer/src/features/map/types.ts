import { z } from 'zod'

/**
 * 지도 기반 매장 조회 도메인 타입 / Zod 스키마 (노션 "지도 기반 매장 조회").
 *
 * - 카카오맵 위에 현재 위치(GPS, fallback 기본 주소지) 중심 반경 안의 매장 마커를 노출.
 * - 거리 필터(1/3/5km)·"마감 할인 판매 중" 토글로 마커를 거른다. 지도 드래그/줌은 결과 재계산 X —
 *   마커는 항상 중심 좌표 기준 거리로 계산(BE/DB ADR-003 PostGIS 책임, FE 는 "이미 필터된" 응답 렌더만).
 */

/** 거리 필터 — 1/3/5km 단일 선택 (노션 정책). default 3km */
export const MAP_DISTANCES = [1, 3, 5] as const
export const mapDistanceSchema = z.union([z.literal(1), z.literal(3), z.literal(5)])
export type MapDistance = z.infer<typeof mapDistanceSchema>
export const DEFAULT_MAP_DISTANCE: MapDistance = 3

/** 지도 마커 + 하단 미니카드용 매장 — 좌표 + 매장 단위 요약 */
export const mapStoreSchema = z.object({
  id: z.number(),
  name: z.string(),
  imageUrl: z
    .string()
    .nullish()
    .transform((v) => v ?? null),
  latitude: z.number().default(0),
  longitude: z.number().default(0),
  /** 중심 좌표 기준 직선거리(km) — BE 계산 */
  distanceKm: z.number().default(0),
  /** 리뷰 평균 평점 (0 = 리뷰 없음) */
  rating: z.number().default(0),
  /** 진행 중(ACTIVE) 마감 할인 개수 — 0이면 회색 기본 마커 */
  activeDealCount: z.number().default(0),
  /** 활성 떨이 중 최대 할인율(%) — 말풍선 마커 라벨. 0이면 할인 없음 */
  maxDiscountRate: z.number().default(0),
})
export type MapStore = z.infer<typeof mapStoreSchema>

/** 지도 매장 조회 요청 파라미터 — 중심 좌표 + 반경 + 마감 할인 토글 */
export const mapStoresParamsSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  radiusKm: mapDistanceSchema,
  /** true = 활성 떨이 보유 매장만 (토글 ON, default) */
  dealsOnly: z.boolean(),
})
export type MapStoresParams = z.infer<typeof mapStoresParamsSchema>
