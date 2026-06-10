import { z } from 'zod'

/**
 * 떨이(마감 할인) 상태 — `clearance.status` (노션: 떨이 상품 마감 처리).
 * OPEN → SOLD_OUT/CLOSED 단방향. 복원 없음.
 * BE 상태값 그대로 사용 (OPEN/SOLD_OUT/CLOSED).
 */
export const CLEARANCE_STATUSES = ['OPEN', 'SOLD_OUT', 'CLOSED'] as const
export const clearanceStatusSchema = z.enum(CLEARANCE_STATUSES)
export type ClearanceStatus = z.infer<typeof clearanceStatusSchema>

/** "HH:MM" (24시간) — 픽업 마감 시각 */
export const clearanceTimeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, '시:분 형식이 올바르지 않아요')

/**
 * 떨이 도메인 모델 — 떨이 별도 테이블, 일반 상품(products) row 참조.
 * soldQty = totalQty - remainingQty (BE remainingQuantity 에서 파생).
 * closeTime = pickupEndAt HH:MM 파생.
 */
export interface Clearance {
  id: number
  /** 참조 일반 상품 id */
  productId: number
  /** 떨이 가격 — 정수 KRW */
  salePrice: number
  /** 등록 수량 (BE totalQuantity) */
  totalQty: number
  /** 판매 수량 = totalQty - remainingQty (BE 파생) */
  soldQty: number
  /** 픽업 마감 — "HH:MM" (pickupEndAt 에서 파생) */
  closeTime: string
  status: ClearanceStatus
  /** ISO 등록 시각 */
  createdAt: string
}

/**
 * 카드/상세 표시용 — BE가 ClearanceItemResponse 에 상품 정보(name/imageUrl/regularPrice) 포함.
 * 목록/상세 API 가 반환. 컴포넌트는 추가 조회 없이 이 뷰만 사용.
 */
export interface ClearanceView extends Clearance {
  productName: string
  productImageUrl?: string
  /** 일반 상품 정상가 — 할인율 계산/표시용 */
  originalPrice: number
  /** 남은 수량 = totalQty - soldQty */
  remainingQty: number
}

/**
 * 떨이 전환(등록) 입력 검증 — 위저드 step 값(문자열) 기준.
 * salePrice < 정상가 는 선택 상품 가격에 의존 → 위저드/ API 에서 별도 검증.
 */
export const createClearanceInputSchema = z.object({
  productId: z.string().min(1, '상품을 선택해 주세요'),
  totalQty: z
    .string()
    .regex(/^\d+$/, '1 이상의 정수로 입력해 주세요')
    .refine((v) => Number(v) >= 1, '1개 이상이어야 해요'),
  salePrice: z.string().regex(/^\d+$/, '0 이상의 정수로 입력해 주세요'),
  closeTime: clearanceTimeSchema,
})
export type CreateClearanceInput = z.infer<typeof createClearanceInputSchema>

/**
 * 떨이 전환 API 페이로드 — 위저드 값 정규화 결과 (수량·가격·상품ID 숫자 변환).
 * storeId 는 useCreateClearance 훅이 주입 (별도 파라미터).
 */
export interface CreateClearancePayload {
  productId: number
  salePrice: number
  totalQty: number
  /** "HH:MM" — API 에서 ISO pickupEndAt 으로 변환 */
  closeTime: string
}

/**
 * 떨이 수정 페이로드 — 활성 떨이의 변경 필드만 (노션: 떨이 상품 수정).
 * totalQuantity = soldQty + remainingQty (ClearanceDetailPage 에서 계산 후 전달).
 * closeTime 은 "HH:MM" — API 에서 ISO pickupEndAt 으로 변환.
 */
export interface UpdateClearancePayload {
  salePrice?: number
  /** 등록 수량 = soldQty + remainingQty (페이지에서 계산 후 전달) */
  totalQuantity?: number
  /** "HH:MM" — API 에서 ISO pickupEndAt 으로 변환 */
  closeTime?: string
}

/** 떨이 수정 폼 검증 — 상세 화면 입력(문자열). salePrice < 정상가 는 화면/ API 에서 별도 검증 */
export const updateClearanceInputSchema = z.object({
  salePrice: z.string().regex(/^\d+$/, '0 이상의 정수로 입력해 주세요'),
  remainingQty: z.string().regex(/^\d+$/, '0 이상의 정수로 입력해 주세요'),
  closeTime: clearanceTimeSchema,
})
export type UpdateClearanceInput = z.infer<typeof updateClearanceInputSchema>
