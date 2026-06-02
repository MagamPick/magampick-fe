import type { NotificationSettingKey } from './types'

export interface SettingMeta {
  key: NotificationSettingKey
  label: string
  desc: string
}

/** 알림 설정 토글 메타 (라벨·설명·표시 순서) — 노션 「알림 설정(사장)」 6종 */
export const SELLER_SETTING_META: SettingMeta[] = [
  { key: 'newOrder', label: '신규 주문', desc: '새 주문이 접수되면 알림' },
  { key: 'orderCancel', label: '주문 취소', desc: '소비자가 주문을 취소하면 알림' },
  { key: 'refundRequest', label: '환불 요청', desc: '환불 요청이 접수되면 알림 (기한 내 처리)' },
  { key: 'newReview', label: '신규 리뷰', desc: '새 리뷰가 등록되면 알림' },
  { key: 'notice', label: '공지', desc: '마감픽 운영 공지·정책 안내' },
  { key: 'marketing', label: '마케팅 정보', desc: '제휴 이벤트·광고성 정보 (필수 아님)' },
]
