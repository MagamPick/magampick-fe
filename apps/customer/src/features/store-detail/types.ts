import { z } from 'zod'

/**
 * 매장 상세 조회 도메인 타입 (노션: 매장 상세 조회 (소비자)).
 * 헤더 + 액션 + 4탭(마감 할인·메뉴·리뷰·정보) + '매장 위치' sub-route.
 * 거리·영업상태·정렬 등은 BE/DB(ADR-003 PostGIS) 책임 — FE는 응답을 렌더만 한다.
 */

/** 매장 영업 상태 — 영업 외(BREAK/CLOSED_TODAY)면 메타 라벨 + 주문/담기 차단 */
export const businessStatusSchema = z.enum(['OPEN', 'BREAK', 'CLOSED_TODAY'])
export type BusinessStatus = z.infer<typeof businessStatusSchema>

/** 요일별 영업시간 — 휴무 요일은 closed=true (open/close null) */
export const operatingHourSchema = z.object({
  /** 요일 라벨 (월·화·…·일) */
  day: z.string(),
  /** 영업 시작 (HH:mm) — 휴무면 null */
  open: z.string().nullable(),
  /** 영업 종료 (HH:mm) — 휴무면 null */
  close: z.string().nullable(),
  closed: z.boolean(),
})
export type OperatingHour = z.infer<typeof operatingHourSchema>

/** 매장 상세 — 헤더/메타/정보 탭 + 지도 sub-route 의 단일 소스 */
export const storeDetailSchema = z.object({
  /** BE int64 → number */
  id: z.number(),
  name: z.string().default(''),
  /** 대표 사진 1장 (없으면 폴백) */
  imageUrl: z.string().nullish().transform((v) => v ?? null),
  businessStatus: businessStatusSchema,
  /** 다음 영업 종료 시각 (HH:mm) — 오늘 휴무면 null */
  closingTime: z.string().nullish().transform((v) => v ?? null),
  /** 평균 평점 */
  rating: z.number().default(0),
  /** 리뷰 개수 */
  reviewCount: z.number().int().default(0),
  /** 직선거리(km) */
  distanceKm: z.number().default(0),
  /** 단골 여부 (헤더 하트) — BE 실값 */
  isFavorite: z.boolean().default(false),
  // 정보 탭
  address: z.string().default(''),
  phone: z.string().default(''),
  /** 사업자 등록 번호 */
  businessNumber: z.string().default(''),
  /** 요일별 영업시간 (월~일 7개) */
  operatingHours: z.array(operatingHourSchema).default([]),
  // 지도 sub-route (카카오맵 SDK 좌표)
  lat: z.number().default(0),
  lng: z.number().default(0),
})
export type StoreDetail = z.infer<typeof storeDetailSchema>

/** 마감 할인 탭 — 매장의 활성 떨이(clearance) 카드 */
export const storeDealSchema = z.object({
  /** BE int64 → number */
  id: z.number(),
  name: z.string().default(''),
  imageUrl: z.string().nullish().transform((v) => v ?? null),
  /** 할인율(%) */
  discountRate: z.number().default(0),
  /** 원가(취소선) */
  originalPrice: z.number().default(0),
  /** 할인가 */
  salePrice: z.number().default(0),
  /** 픽업 마감 시각(ISO) — 실시간 카운트다운 기준 */
  pickupDeadline: z.string(),
  /** 잔여 수량 */
  stockLeft: z.number().int().default(0),
})
export type StoreDeal = z.infer<typeof storeDealSchema>

/** 메뉴 탭 — 판매 ON 일반 상품(product). 카테고리로 그룹화 노출 */
export const storeMenuItemSchema = z.object({
  /** BE int64 → number */
  id: z.number(),
  name: z.string().default(''),
  imageUrl: z.string().nullish().transform((v) => v ?? null),
  /** 정가 */
  price: z.number().default(0),
  /** 카테고리 (베이커리·음료·디저트 등) — 그룹화 키 */
  category: z.string().default(''),
})
export type StoreMenuItem = z.infer<typeof storeMenuItemSchema>

/** 리뷰 카드 — 사장 답글이 있으면 함께 노출 */
export const storeReviewSchema = z.object({
  /** BE int64 → number */
  id: z.number(),
  authorNickname: z.string().default(''),
  /** 별점 1~5 */
  rating: z.number().int().default(0),
  content: z.string().default(''),
  /** 작성일 (M/D 표기용 ISO) */
  createdAt: z.string(),
  /** 주문 상품들 — 각 상품 상세 링크(kind 로 경로 분기) */
  products: z
    .array(
      z.object({
        /** BE int64 → number */
        productId: z.number(),
        kind: z.enum(['deal', 'menu']),
        name: z.string().default(''),
      }),
    )
    .default([]),
  photos: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  /** 사장 답글 (없으면 null) */
  ownerReply: z.string().nullish().transform((v) => v ?? null),
})
export type StoreReview = z.infer<typeof storeReviewSchema>

/** 별점 분포 막대 한 칸 (5점→1점 순) */
export const ratingBucketSchema = z.object({
  star: z.number().int(),
  count: z.number().int(),
})
export type RatingBucket = z.infer<typeof ratingBucketSchema>

/** 리뷰 요약 — 평균 + 분포(목록 상단 고정) */
export const reviewSummarySchema = z.object({
  average: z.number().default(0),
  count: z.number().int().default(0),
  /** 5→1점 순 분포 */
  distribution: z.array(ratingBucketSchema).default([]),
})
export type ReviewSummary = z.infer<typeof reviewSummarySchema>

/**
 * 리뷰 무한 스크롤 페이지 — BE offset 응답(SliceResponse) → items 매핑.
 * BE shape: { content, page, size, hasNext }
 * FE 다운스트림: items(=content), page, size, hasNext
 */
export const storeReviewPageSchema = z
  .object({
    content: z.array(storeReviewSchema).default([]),
    page: z.number().int().default(0),
    size: z.number().int().default(0),
    hasNext: z.boolean().default(false),
  })
  .transform((d) => ({
    items: d.content,
    page: d.page,
    size: d.size,
    hasNext: d.hasNext,
  }))
export type StoreReviewPage = z.infer<typeof storeReviewPageSchema>

/** 매장 상세 라우트 파라미터 — URL 에서 string으로 수신, 훅/API 호출 시 Number() 변환 */
export const storeDetailParamsSchema = z.object({
  id: z.string().min(1),
})
export type StoreDetailParams = z.infer<typeof storeDetailParamsSchema>
