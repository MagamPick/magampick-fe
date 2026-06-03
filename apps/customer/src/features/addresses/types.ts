import { z } from 'zod'

/**
 * 주소지 관리 도메인 타입 / Zod 스키마 (노션 "주소지 관리" 명세).
 *
 * - 주소 필드 = 별칭 · 도로명 · 상세주소 · 좌표 (+ 기본 여부). 픽업 메모는 명세 비범위.
 * - 도로명·좌표는 검색/GPS(역지오코딩) 결과로만 결정 (직접 입력 X). 수정 시 별칭·상세만 변경 가능.
 */

/** 1인당 최대 주소 개수 (노션: 최대 3개) */
export const MAX_ADDRESSES = 3

/** 도메인 에러 코드 (노션 인수 기준) — mock API 가 ApiError.code 로 사용 */
export const ADDRESS_ERROR = {
  LIMIT_EXCEEDED: 'ADDRESS_LIMIT_EXCEEDED',
  ALIAS_LENGTH: 'ALIAS_LENGTH',
  DEFAULT_DELETE_BLOCKED: 'DEFAULT_ADDRESS_DELETE_BLOCKED',
  LAST_DELETE_BLOCKED: 'LAST_ADDRESS_DELETE_BLOCKED',
  GEOCODING_FAILED: 'GEOCODING_FAILED',
  NOT_FOUND: 'ADDRESS_NOT_FOUND',
} as const

/** 별칭 1~10자 (노션 AC: ALIAS_LENGTH) — 중복 허용 */
export const aliasSchema = z
  .string()
  .min(1, '별칭을 입력해주세요')
  .max(10, '별칭은 10자 이하여야 합니다')

/** 저장된 주소 */
export const addressSchema = z.object({
  id: z.string(),
  label: z.string(), // 별칭
  roadAddress: z.string(), // 도로명 주소 (수정 불가)
  detail: z.string(), // 상세 주소 (자유 입력, 빈 문자열 허용)
  latitude: z.number(),
  longitude: z.number(),
  isDefault: z.boolean(),
})
export type Address = z.infer<typeof addressSchema>

/** 주소 추가 입력 — 도로명·좌표는 검색/GPS 결과에서 채워진다 */
export const createAddressInputSchema = z.object({
  roadAddress: z.string().min(1, '도로명 주소를 선택해주세요'),
  latitude: z.number(),
  longitude: z.number(),
  label: aliasSchema,
  detail: z.string().max(40, '상세 주소는 40자 이하여야 합니다'),
})
export type CreateAddressInput = z.infer<typeof createAddressInputSchema>

/**
 * 주소 수정 입력 — 별칭·상세 + 도로명·좌표.
 * (노션 결정 2026-05-31: 수정에서도 '다시 검색'으로 도로명 변경 가능 → 변경 시 좌표 함께 갱신.
 *  기존 "도로명 수정 불가(삭제 후 재등록)" 정책에서 변경.)
 */
export const updateAddressInputSchema = z.object({
  roadAddress: z.string().min(1, '도로명 주소를 선택해주세요'),
  latitude: z.number(),
  longitude: z.number(),
  label: aliasSchema,
  detail: z.string().max(40, '상세 주소는 40자 이하여야 합니다'),
})
export type UpdateAddressInput = z.infer<typeof updateAddressInputSchema>

/** 입력 폼(react-hook-form) 필드 — 사용자가 직접 타이핑하는 별칭·상세. 도로명·좌표는 검색/GPS 결과. */
export const addressFormSchema = z.object({
  label: aliasSchema,
  detail: z.string().max(40, '상세 주소는 40자 이하여야 합니다'),
})
export type AddressFormValues = z.infer<typeof addressFormSchema>

/** 주소 검색 / 역지오코딩 결과 (mock 카카오 로컬 — ADR-002, 연동 PR 에서 실 API) */
export const addressSearchResultSchema = z.object({
  roadAddress: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  zip: z.string().optional(),
})
export type AddressSearchResult = z.infer<typeof addressSearchResultSchema>
