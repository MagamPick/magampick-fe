/**
 * 통계(analytics) 도메인 타입 — 노션 「사장 통계 대시보드」(사장, Phase 10).
 * 사장이 현재 선택 매장의 매출·주문·떨이·리뷰 지표를 기간(오늘·주·달·올해)별로 본다.
 * BE analytics 도메인 실연동 — apiClient + Zod 응답 검증(analyticsApi).
 * 숫자(raw)만 보관하고 표시 포맷(원/%/증감)은 lib/analyticsFormat 의 순수 함수가 담당.
 */

/** 기간 토글 — 오늘·이번 주·이번 달·올해. 사용자 지정 임의 기간(날짜 범위)은 백로그. */
export type AnalyticsPeriod = 'today' | 'week' | 'month' | 'year'

/** 기간 토글 표시 순서·라벨 (PeriodToggle 렌더 source) */
export const ANALYTICS_PERIODS: { value: AnalyticsPeriod; label: string }[] = [
  { value: 'today', label: '오늘' },
  { value: 'week', label: '이번 주' },
  { value: 'month', label: '이번 달' },
  { value: 'year', label: '올해' },
]

/** 패널 세그먼트 — 매출·주문·떨이·리뷰 */
export type AnalyticsPanel = 'sales' | 'orders' | 'clearance' | 'review'

/** 패널 탭 표시 순서·라벨 (PanelTabs 렌더 source) */
export const ANALYTICS_PANELS: { value: AnalyticsPanel; label: string }[] = [
  { value: 'sales', label: '매출' },
  { value: 'orders', label: '주문' },
  { value: 'clearance', label: '떨이' },
  { value: 'review', label: '리뷰' },
]

/**
 * 고정 빠른평가 태그 7종 (소비자 리뷰작성 화면의 고정 칩) — 리뷰 패널은 이 태그들의
 * 카운트만 집계해 상위를 보여준다(NLP·텍스트 마이닝 아님 — 노션 비범위).
 */
export const QUICK_EVAL_TAGS = [
  '맛있어요',
  '신선해요',
  '재구매',
  '픽업 빨라요',
  '양 많아요',
  '가성비',
  '친절해요',
] as const
export type QuickEvalTag = (typeof QUICK_EVAL_TAGS)[number]

/** 매출 막대차트 1개 — 라벨(시간대/요일/주차/월) + 값(원). 높이·최고점은 표시 시 파생. */
export interface SalesBar {
  label: string
  amount: number
}

/**
 * 매출 패널 지표.
 * ⚠️ 매출 = 픽업 완료(수령완료) 주문의 결제 금액 합계 = 총매출(수수료 차감 전).
 * 정산 내역(Phase 6)의 정산액(= 매출 − 수수료 6.5% = 실수령액)과는 다른 숫자다.
 */
export interface SalesMetrics {
  /** 기간 매출액(원) = 총매출 */
  totalSales: number
  /** 전기 대비 증감률(%) — 양수=증가 / 음수=감소 */
  deltaPct: number
  /** 기간별 막대 — 오늘=시간대 / 주=요일 / 달=주차 / 올해=월 */
  chart: SalesBar[]
  /** 평균 객단가(원) */
  avgOrderValue: number
  /** 최다 주문 시간대 라벨 (예: "18 ~ 19시") */
  peakHour: string
}

/** 주문 패널 지표 — 픽업 완료율(%)은 pickupRate()로 파생. */
export interface OrderMetrics {
  /** 총 주문 건수 */
  total: number
  /** 픽업 완료 건수 */
  pickedUp: number
  /** 취소 건수 */
  canceled: number
  /** 미수령(노쇼) 건수 */
  noShow: number
}

/** 떨이 판매현황 패널 지표 (마감픽 미션 = 폐기 절감). */
export interface ClearanceMetrics {
  /** 마감 할인 판매 수량(개) */
  soldQty: number
  /** 폐기 절감 수량(개) */
  savedQty: number
  /** 폐기 절감 금액(원) */
  savedAmount: number
  /** 평균 할인율(%) */
  avgDiscountRate: number
}

/** 리뷰 빠른평가 태그 카운트 */
export interface ReviewTagCount {
  tag: QuickEvalTag
  count: number
}

/** 리뷰 패널 지표. */
export interface ReviewMetrics {
  /** 평균 별점 (1.0~5.0) */
  avgRating: number
  /** 신규 리뷰 수 */
  newCount: number
  /** 답글 작성률(%) */
  replyRate: number
  /** 자주 언급된 빠른평가 태그 (카운트 desc 정렬, 상위 N) */
  tags: ReviewTagCount[]
}

/** 한 기간의 통계 묶음 — 4개 패널. */
export interface AnalyticsData {
  sales: SalesMetrics
  orders: OrderMetrics
  clearance: ClearanceMetrics
  review: ReviewMetrics
}
