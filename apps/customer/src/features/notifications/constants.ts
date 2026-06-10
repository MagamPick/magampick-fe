import { ROUTES } from '@/shared/lib/routes'
import type { SegTabItem } from '@/shared/components/SegTabs'
import type { NotificationCategory, NotificationSegment, NotificationSettingKey } from './types'

/** 알림센터 세그먼트 탭 (소비자) — SegTabs 재사용 */
export const SEGMENT_TABS: SegTabItem<NotificationSegment>[] = [
  { value: 'all', label: '전체' },
  { value: 'deal', label: '마감 할인' },
  { value: 'order', label: '주문' },
]

export interface SettingMeta {
  key: NotificationSettingKey
  label: string
  desc: string
}

/** 알림 설정 토글 메타 (라벨·설명·표시 순서) — 노션 「알림 설정(소비자)」 6종 */
export const CUSTOMER_SETTING_META: SettingMeta[] = [
  { key: 'nearbyDeal', label: '주변 떨이', desc: '위치 기반 떨이 등록·마감 임박 알림' },
  { key: 'favoriteStore', label: '단골 매장', desc: '단골 매장의 떨이 등록·마감 임박 알림' },
  { key: 'orderRefund', label: '주문·환불', desc: '주문 상태·취소·환불 알림' },
  { key: 'reviewReply', label: '리뷰 답글', desc: '내 리뷰에 사장님이 답글을 달면 알림' },
  { key: 'eventBenefit', label: '이벤트·혜택', desc: '이벤트/쿠폰·혜택 소멸 예정 알림' },
  { key: 'marketing', label: '마케팅 정보', desc: '제휴 이벤트·광고성 정보 (필수 아님)' },
]

/**
 * category → 표시 이모지 아이콘.
 * icon 필드가 BE 응답에 없으므로 category 기반으로 FE 에서 파생한다.
 */
export const CATEGORY_ICON: Record<NotificationCategory, string> = {
  deal: '🔥',
  order: '🛍️',
  review: '💬',
  benefit: '🎁',
  system: '📢',
  refund: '↩️',
  settlement: '💰',
  notice: '📢',
  inquiry: '💬',
}

/**
 * category → 클릭 시 이동할 내부 라우트.
 * link 필드(딥링크 문자열)는 무시하고 category 로 결정.
 * system / settlement 는 별도 라우트 없음 → null.
 */
export function resolveNotificationRoute(category: NotificationCategory): string | null {
  switch (category) {
    case 'deal':
      return ROUTES.HOME
    case 'order':
    case 'refund':
      return ROUTES.ORDERS
    case 'review':
      return ROUTES.MY_REVIEWS
    case 'benefit':
      return ROUTES.COUPONS
    case 'notice':
      return ROUTES.NOTICES
    case 'inquiry':
      return ROUTES.SUPPORT
    case 'system':
    case 'settlement':
      return null
  }
}
