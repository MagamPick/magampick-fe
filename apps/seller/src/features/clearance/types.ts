import { z } from 'zod'

/**
 * 떨이(마감 할인) 상태 — `clearance.status` (노션: 떨이 상품 마감 처리).
 * ACTIVE → CLOSED/SOLD_OUT 단방향. 복원 없음.
 */
export const CLEARANCE_STATUSES = ['ACTIVE', 'CLOSED', 'SOLD_OUT'] as const
export const clearanceStatusSchema = z.enum(CLEARANCE_STATUSES)
export type ClearanceStatus = z.infer<typeof clearanceStatusSchema>

/** 마감 사유 — 트리거 종류 자동 기록 (사장 별도 입력 X) */
export const CLEARANCE_CLOSE_REASONS = ['EXPIRED', 'SOLD_OUT', 'MANUAL'] as const
export type ClearanceCloseReason = (typeof CLEARANCE_CLOSE_REASONS)[number]

/** "HH:MM" (24시간) — 픽업 마감 시각 */
export const clearanceTimeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, '시:분 형식이 올바르지 않아요')

/**
 * 떨이 도메인 모델 — 별도 테이블, 일반 상품(`products`) row 참조 (노션: 일반 상품 떨이 전환).
 * 상품명·카테고리·사진·정상가는 참조 상품에서 join (별도 저장 X).
 */
export interface Clearance {
  id: string
  storeId: string
  /** 참조 일반 상품 id */
  productId: string
  /** 떨이 가격 — 정수 KRW, 0 이상 + 정상가 미만 */
  salePrice: number
  /** 등록 수량 = soldQty + remainingQty */
  totalQty: number
  /** 판매 수량 — 시스템값(주문 시 자동 증가). mock 은 seed/0 */
  soldQty: number
  /** 픽업 마감 — "HH:MM" 오늘 절대 시각 */
  closeTime: string
  status: ClearanceStatus
  /** 마감 시 기록 (status !== ACTIVE) */
  closeReason?: ClearanceCloseReason
  /** ISO 등록 시각 */
  createdAt: string
}

/**
 * 카드/상세 표시용 — 참조 일반 상품 필드 join + 남은 수량 파생.
 * 목록/상세 API 가 반환. 컴포넌트는 추가 조회 없이 이 뷰만 사용.
 */
export interface ClearanceView extends Clearance {
  productName: string
  productImageUrl?: string
  /** 일반 상품 정상가 — 할인율 계산/표시용 */
  originalPrice: number
  /** 남은 수량 = totalQty - soldQty (파생) */
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

/** 떨이 전환 API 페이로드 — 위저드 값 정규화 결과 (수량·가격 숫자 변환) */
export interface CreateClearancePayload {
  storeId: string
  productId: string
  salePrice: number
  totalQty: number
  /** "HH:MM" */
  closeTime: string
}

/** 떨이 수정 페이로드 — 활성 떨이의 변경 필드만 (노션: 떨이 상품 수정) */
export interface UpdateClearancePayload {
  salePrice?: number
  /** 남은 수량 직접 수정 (등록 수량 = soldQty + remainingQty 자동 갱신) */
  remainingQty?: number
  /** "HH:MM" */
  closeTime?: string
}

/** 떨이 수정 폼 검증 — 상세 화면 입력(문자열). salePrice < 정상가 는 화면/ API 에서 별도 검증 */
export const updateClearanceInputSchema = z.object({
  salePrice: z.string().regex(/^\d+$/, '0 이상의 정수로 입력해 주세요'),
  remainingQty: z.string().regex(/^\d+$/, '0 이상의 정수로 입력해 주세요'),
  closeTime: clearanceTimeSchema,
})
export type UpdateClearanceInput = z.infer<typeof updateClearanceInputSchema>
