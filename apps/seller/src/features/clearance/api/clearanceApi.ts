import { ApiError } from '@/shared/lib/apiError'
import { peekProduct } from '@/features/product/api/productApi'
import { storeApi } from '@/features/store/api/storeApi'
import { isExpired, nowHHMM } from '../lib/clearanceStatus'
import { clearanceTimeSchema } from '../types'
import type {
  Clearance,
  ClearanceView,
  CreateClearancePayload,
  UpdateClearancePayload,
} from '../types'

/**
 * ⚠️ Mock 스텁 — 떨이 BE(BE 완료 NO) 미구현. in-memory 로 상태 유지.
 * 실연동 시 `apiClient` 호출 + Zod 응답 검증으로 교체 (api-client-convention).
 * 자동 마감(시간)은 BE 주기 스케줄러 — mock 은 읽기 시 lazy 판정(`syncExpiry`)으로 대체.
 * 권한(본인 소유 매장만)은 BE/연동 책임 — mock 은 단일 사장 가정.
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * 데모 시드: s1 에 떨이 2종.
 * - c1 ACTIVE: 통밀 식빵(p1) 50% 떨이, 8/20 판매, 마감 23:59
 * - c2 SOLD_OUT: 아메리카노(p2) 수량 소진(10/10), 마감 14:00
 */
function seed(): Clearance[] {
  return [
    {
      id: 'c1',
      storeId: 's1',
      productId: 'p1',
      salePrice: 2400,
      totalQty: 20,
      soldQty: 8,
      closeTime: '23:59',
      status: 'ACTIVE',
      createdAt: '2026-06-01T08:00:00.000Z',
    },
    {
      id: 'c2',
      storeId: 's1',
      productId: 'p2',
      salePrice: 1500,
      totalQty: 10,
      soldQty: 10,
      closeTime: '14:00',
      status: 'SOLD_OUT',
      closeReason: 'SOLD_OUT',
      createdAt: '2026-06-01T07:00:00.000Z',
    },
  ]
}

let clearances: Clearance[] = seed()
let seq = 100

/** 테스트 전용 — 모듈 in-memory 상태 초기화 */
export function resetClearanceState() {
  clearances = seed()
  seq = 100
}

/** 만료된 ACTIVE 떨이를 CLOSED(EXPIRED)로 lazy 동기화 (BE 스케줄러 대체) */
function syncExpiry() {
  const now = nowHHMM()
  for (const c of clearances) {
    if (c.status === 'ACTIVE' && isExpired(c.closeTime, now)) {
      c.status = 'CLOSED'
      c.closeReason = 'EXPIRED'
    }
  }
}

/** 참조 일반 상품 join + 남은 수량 파생 */
function toView(c: Clearance): ClearanceView {
  const product = peekProduct(c.productId)
  return {
    ...c,
    productName: product?.name ?? '(삭제된 상품)',
    productImageUrl: product?.imageUrl,
    originalPrice: product?.price ?? 0,
    remainingQty: c.totalQty - c.soldQty,
  }
}

function find(id: string): Clearance {
  const c = clearances.find((x) => x.id === id)
  if (!c) throw new ApiError(404, 'CLEARANCE_NOT_FOUND', '마감 할인을 찾을 수 없어요')
  return c
}

/** 상품의 활성 떨이 (동시 1개 규칙·자동 마감 조회용) */
function activeForProduct(productId: string): Clearance | undefined {
  return clearances.find((c) => c.productId === productId && c.status === 'ACTIVE')
}

export const clearanceApi = {
  /** 매장 떨이 목록 — 등록 최신순, 참조 상품 join */
  async listClearances(storeId: string): Promise<ClearanceView[]> {
    await delay(300)
    syncExpiry()
    return clearances
      .filter((c) => c.storeId === storeId)
      .slice()
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0))
      .map(toView)
  },

  /** 떨이 단건 조회 (상세·수정 화면) */
  async getClearance(id: string): Promise<ClearanceView> {
    await delay(300)
    syncExpiry()
    return toView(find(id))
  },

  /** 떨이 전환(등록) — 서버측 미러 검증 후 ACTIVE row 생성 (노션: 일반 상품 떨이 전환) */
  async createClearance(payload: CreateClearancePayload): Promise<ClearanceView> {
    await delay(400)
    syncExpiry()

    const product = peekProduct(payload.productId)
    if (!product || product.storeId !== payload.storeId) {
      throw new ApiError(404, 'PRODUCT_NOT_FOUND', '상품을 찾을 수 없어요')
    }
    if (!product.onSale) {
      throw new ApiError(409, 'PRODUCT_NOT_ON_SALE', '판매 중인 상품만 마감 할인으로 전환할 수 있어요')
    }
    if (activeForProduct(payload.productId)) {
      throw new ApiError(409, 'PRODUCT_ALREADY_ON_CLEARANCE', '이미 진행 중인 마감 할인이 있어요')
    }
    if (!Number.isInteger(payload.totalQty) || payload.totalQty < 1) {
      throw new ApiError(422, 'CLEARANCE_INVALID_QTY', '수량은 1개 이상이어야 해요')
    }
    if (!Number.isInteger(payload.salePrice) || payload.salePrice < 0) {
      throw new ApiError(422, 'CLEARANCE_INVALID_PRICE', '할인가는 0 이상의 정수여야 해요')
    }
    if (payload.salePrice >= product.price) {
      throw new ApiError(422, 'CLEARANCE_PRICE_TOO_HIGH', '할인가는 정상가보다 낮아야 해요')
    }

    // clearance 피처 mock storeId는 string — Step2 실연동 시 number로 이전. 임시 변환.
    const status = await storeApi.getStoreStatus(Number(payload.storeId) || 1)
    if (status.operationStatus !== 'OPEN') {
      throw new ApiError(409, 'STORE_NOT_OPEN', '영업 중일 때만 마감 할인을 등록할 수 있어요')
    }
    const now = nowHHMM()
    if (!clearanceTimeSchema.safeParse(payload.closeTime).success || payload.closeTime <= now) {
      throw new ApiError(422, 'CLEARANCE_INVALID_CLOSE_TIME', '픽업 마감은 현재 시각 이후로 설정해 주세요')
    }
    if (status.todayCloseTime && payload.closeTime > status.todayCloseTime) {
      throw new ApiError(422, 'CLEARANCE_CLOSE_AFTER_HOURS', '픽업 마감은 영업 종료 시각 이전이어야 해요')
    }

    const clearance: Clearance = {
      id: `c${seq++}`,
      storeId: payload.storeId,
      productId: payload.productId,
      salePrice: payload.salePrice,
      totalQty: payload.totalQty,
      soldQty: 0,
      closeTime: payload.closeTime,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    }
    clearances.push(clearance)
    // 알림 발송 트리거(→ 떨이 등록 알림, Phase 7) — mock no-op
    return toView(clearance)
  },

  /**
   * 떨이 수정 — 활성(ACTIVE) 떨이의 할인가·남은 수량·픽업 마감 시각 (노션: 떨이 상품 수정).
   * 남은 수량만 수정 → 등록 수량 = 판매 수량 + 남은 수량 자동 갱신. 0 도달 시 SOLD_OUT.
   * 영업 상태 무관(수정은 진행 중 떨이 조정). 마감된 떨이는 거부.
   */
  async updateClearance(id: string, payload: UpdateClearancePayload): Promise<ClearanceView> {
    await delay(400)
    syncExpiry()
    const c = find(id)
    if (c.status !== 'ACTIVE') {
      throw new ApiError(409, 'CLEARANCE_NOT_EDITABLE', '마감된 마감 할인은 수정할 수 없어요')
    }
    const product = peekProduct(c.productId)

    let nextSalePrice = c.salePrice
    if (payload.salePrice !== undefined) {
      if (!Number.isInteger(payload.salePrice) || payload.salePrice < 0) {
        throw new ApiError(422, 'CLEARANCE_INVALID_PRICE', '할인가는 0 이상의 정수여야 해요')
      }
      if (product && payload.salePrice >= product.price) {
        throw new ApiError(422, 'CLEARANCE_PRICE_TOO_HIGH', '할인가는 정상가보다 낮아야 해요')
      }
      nextSalePrice = payload.salePrice
    }

    let nextTotal = c.totalQty
    let soldOut = false
    if (payload.remainingQty !== undefined) {
      if (!Number.isInteger(payload.remainingQty) || payload.remainingQty < 0) {
        throw new ApiError(422, 'CLEARANCE_INVALID_QTY', '남은 수량은 0 이상의 정수여야 해요')
      }
      nextTotal = c.soldQty + payload.remainingQty
      soldOut = payload.remainingQty === 0
    }

    let nextCloseTime = c.closeTime
    if (payload.closeTime !== undefined) {
      // clearance 피처 mock storeId는 string — Step2 실연동 시 number로 이전. 임시 변환.
      const status = await storeApi.getStoreStatus(Number(c.storeId) || 1)
      const now = nowHHMM()
      if (!clearanceTimeSchema.safeParse(payload.closeTime).success || payload.closeTime <= now) {
        throw new ApiError(
          422,
          'CLEARANCE_INVALID_CLOSE_TIME',
          '픽업 마감은 현재 시각 이후로 설정해 주세요',
        )
      }
      if (status.todayCloseTime && payload.closeTime > status.todayCloseTime) {
        throw new ApiError(
          422,
          'CLEARANCE_CLOSE_AFTER_HOURS',
          '픽업 마감은 영업 종료 시각 이전이어야 해요',
        )
      }
      nextCloseTime = payload.closeTime
    }

    c.salePrice = nextSalePrice
    c.totalQty = nextTotal
    c.closeTime = nextCloseTime
    if (soldOut) {
      c.status = 'SOLD_OUT'
      c.closeReason = 'SOLD_OUT'
    }
    // 수정은 알림 재발송 X (노션) — mock no-op
    return toView(c)
  },

  /**
   * 상품의 활성 떨이 자동 마감 — 상품 삭제 시 함께 마감 (노션: 떨이 자동 마감 후 일반 상품 soft delete).
   * 활성 떨이가 없으면 no-op.
   */
  async closeActiveByProduct(productId: string): Promise<void> {
    await delay(200)
    syncExpiry()
    const c = activeForProduct(productId)
    if (c) {
      c.status = 'CLOSED'
      c.closeReason = 'MANUAL'
    }
  },

  /** 수동 마감(조기 마감) — 활성 떨이를 즉시 CLOSED(MANUAL). 단방향, 복원 X (노션: 떨이 상품 마감 처리). */
  async closeClearance(id: string): Promise<ClearanceView> {
    await delay(400)
    syncExpiry()
    const c = find(id)
    if (c.status !== 'ACTIVE') {
      throw new ApiError(409, 'CLEARANCE_NOT_EDITABLE', '이미 마감된 마감 할인이에요')
    }
    c.status = 'CLOSED'
    c.closeReason = 'MANUAL'
    return toView(c)
  },
}
