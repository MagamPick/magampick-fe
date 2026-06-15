import { INQUIRY_CATEGORIES, type InquiryCategory, type InquiryStatus } from '../types'

/** 문의 상태 한글 라벨 */
export const INQUIRY_STATUS_LABEL: Record<InquiryStatus, string> = {
  pending: '답변 대기',
  answered: '답변 완료',
}

/** 카테고리 한글 라벨 (9종 고정) */
export const INQUIRY_CATEGORY_LABEL: Record<InquiryCategory, string> = {
  payment: '결제',
  order: '주문',
  coupon: '쿠폰',
  account: '계정',
  report: '신고',
  settlement: '정산',
  store: '매장',
  product: '상품',
  etc: '기타',
}

/**
 * 응답 category → 한글 라벨. 9종 매핑에 없으면(미지/신규 값) 원문을, 빈 값이면 "기타" 로 fallback.
 * 응답 파싱을 enum 으로 강제하지 않기 때문에(관대 파싱) 라벨 단계에서 안전하게 흡수한다.
 */
export function inquiryCategoryLabel(category: string): string {
  const known = INQUIRY_CATEGORY_LABEL[category as InquiryCategory]
  if (known) return known
  return category.trim() ? category : INQUIRY_CATEGORY_LABEL.etc
}

/** 필터 select 카테고리 옵션 — 9종 고정 ("전체" 는 컴포넌트에서 별도 추가) */
export const INQUIRY_CATEGORY_OPTIONS: { value: InquiryCategory; label: string }[] =
  INQUIRY_CATEGORIES.map((value) => ({ value, label: INQUIRY_CATEGORY_LABEL[value] }))
