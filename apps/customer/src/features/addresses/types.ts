import { z } from 'zod'
import { nullableString } from '@/shared/lib/zodNullable'

/**
 * 주소지 관리 도메인 타입 / Zod 스키마 (노션 "주소지 관리" 명세).
 *
 * 등록 경로 2종 (X3 / findings A3-1·A3-2·A3-3):
 * - 검색 경로(다음 위젯): sigunguCode+roadnameCode 전송 → BE 가 코드로 지오코딩.
 * - GPS 경로(현재 위치): 브라우저가 이미 가진 좌표(lat/lng)를 직접 전송 → BE 가 raw 좌표 저장(코드 불필요).
 */

/** 1인당 최대 주소 개수 (노션: 최대 3개) */
export const MAX_ADDRESSES = 3

/**
 * 도메인 에러 코드 (BE 가 반환하는 ApiError.code 상수 문서화).
 * 클라이언트는 직접 throw 하지 않음 — BE envelope→ApiError 로 수신.
 */
export const ADDRESS_ERROR = {
  LIMIT_EXCEEDED: 'ADDRESS_LIMIT_EXCEEDED',
  ALIAS_LENGTH: 'ALIAS_LENGTH',
  DEFAULT_DELETE_BLOCKED: 'DEFAULT_ADDRESS_DELETE_BLOCKED',
  LAST_DELETE_BLOCKED: 'LAST_ADDRESS_DELETE_BLOCKED',
  GEOCODING_FAILED: 'GEOCODING_FAILED',
  NOT_FOUND: 'ADDRESS_NOT_FOUND',
} as const

/** 별칭 1~20자 (노션 AC·BE 확정값 20, B1-2) */
export const aliasSchema = z
  .string()
  .min(1, '별칭을 입력해주세요')
  .max(20, '별칭은 20자 이하여야 합니다')

/** BE AddressResponse Zod 파싱 스키마 (id: number, detailAddress optional) */
export const addressResponseSchema = z.object({
  id: z.number(),
  label: z.string(),
  roadAddress: z.string(),
  // BE 가 jibunAddress/detailAddress 를 null 로 내려줄 수 있어 nullish 로 수용 (.optional() 은 null 거부)
  jibunAddress: z.string().nullish(),
  detailAddress: z.string().nullish(),
  zonecode: nullableString(),
  latitude: z.number(),
  longitude: z.number(),
  isDefault: z.boolean(),
  createdAt: nullableString(),
  updatedAt: nullableString(),
})

/**
 * 정규화된 클라이언트 주소 타입.
 * detailAddress: BE 응답에 없으면 '' 으로 정규화 (컴포넌트에서 null 체크 불필요).
 */
export const addressSchema = z.object({
  id: z.number(),
  label: z.string(),
  roadAddress: z.string(),
  jibunAddress: z.string().optional(),
  detailAddress: z.string(),
  zonecode: z.string().optional(),
  latitude: z.number(),
  longitude: z.number(),
  isDefault: z.boolean(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})
export type Address = z.infer<typeof addressSchema>

/** 역지오코딩 응답 스키마 */
export const reverseGeocodeResponseSchema = z.object({
  roadAddress: z.string(),
})

/**
 * 다음 우편번호 위젯 / GPS 역지오코딩 결과 (검색 중간 타입).
 * - 다음 위젯: roadAddress·jibunAddress·zonecode·sigunguCode·roadnameCode 보유 (좌표 없음)
 * - GPS 역지오코딩: roadAddress + latitude·longitude 보유 (코드 없음)
 */
export const addressSearchResultSchema = z.object({
  roadAddress: z.string(),
  jibunAddress: z.string().optional(),
  zonecode: z.string().optional(),
  sigunguCode: z.string().optional(),
  roadnameCode: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
})
export type AddressSearchResult = z.infer<typeof addressSearchResultSchema>

/**
 * 주소 추가 API 요청 바디 (BE AddressCreateRequest).
 * BE 는 (좌표 OR 코드) 한 쌍을 요구 (@AssertTrue): GPS 경로는 latitude/longitude,
 * 검색 경로는 sigunguCode/roadnameCode 를 채워 보낸다 (X3 / findings A3-1·A3-2·A3-3).
 */
export const createAddressInputSchema = z.object({
  label: aliasSchema,
  roadAddress: z.string().optional(),
  jibunAddress: z.string().optional(),
  detailAddress: z.string().max(40, '상세 주소는 40자 이하여야 합니다').optional(),
  zonecode: z.string().optional(),
  sigunguCode: z.string().optional(),
  roadnameCode: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
})
export type CreateAddressInput = z.infer<typeof createAddressInputSchema>

/**
 * 주소 수정 API 요청 바디 (BE AddressUpdateRequest — 부분 수정).
 * 도로명 변경 시 sigunguCode + roadnameCode 동반 필요.
 */
export const updateAddressInputSchema = z.object({
  label: aliasSchema.optional(),
  roadAddress: z.string().optional(),
  jibunAddress: z.string().optional(),
  detailAddress: z.string().max(40, '상세 주소는 40자 이하여야 합니다').optional(),
  zonecode: z.string().optional(),
  sigunguCode: z.string().optional(),
  roadnameCode: z.string().optional(),
  geocodeKeyValid: z.boolean().optional(),
})
export type UpdateAddressInput = z.infer<typeof updateAddressInputSchema>

/** 입력 폼(react-hook-form) 필드 — 사용자가 직접 타이핑하는 별칭·상세 주소 */
export const addressFormSchema = z.object({
  label: aliasSchema,
  detailAddress: z.string().max(40, '상세 주소는 40자 이하여야 합니다'),
})
export type AddressFormValues = z.infer<typeof addressFormSchema>
