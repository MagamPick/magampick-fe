import { ROUTES } from '@/shared/lib/routes'
import {
  notificationListSchema,
  notificationSettingsSchema,
  type Notification,
  type NotificationSettingKey,
  type NotificationSettings,
} from '../types'

/**
 * ⚠️ Mock 스텁 — notification BE(BE 완료 NO)가 아직이라 가짜 응답.
 * 모듈 인메모리(`notifications`/`settings`)로 알림 저장·읽음·설정 토글을 흉내낸다(세션 내 유지).
 * 사장 알림센터는 세그먼트 없이 시간순 단일 리스트. 연동 PR 에서 apiClient + Zod 응답 검증으로 교체.
 */

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

/** 설정 기본값 — 거래·공지 ON, 마케팅(광고성) OFF (정보통신망법 opt-in) */
const DEFAULT_SETTINGS: NotificationSettings = {
  newOrder: true,
  orderCancel: true,
  refundRequest: true,
  newReview: true,
  notice: true,
  marketing: false,
}

interface Seed extends Omit<Notification, 'createdAt'> {
  agoMin: number
}

const SEED: Seed[] = [
  { id: 'sn1', category: 'order', icon: '🧾', title: '새 주문이 들어왔어요', body: '빵순이님 · 버터 크루아상 외 2건', read: false, link: ROUTES.ORDERS, agoMin: 5 },
  { id: 'sn2', category: 'review', icon: '💬', title: '새 리뷰가 등록되었어요', body: '라라님이 별점 3점 리뷰를 남겼어요.', read: false, link: ROUTES.REVIEWS, agoMin: 60 },
  { id: 'sn3', category: 'refund', icon: '💸', title: '환불 요청이 접수되었어요', body: '모닝콜님이 환불을 요청했어요. 3일 내 처리해 주세요.', read: false, link: ROUTES.REFUNDS, agoMin: 150 },
  { id: 'sn4', category: 'order', icon: '❌', title: '주문이 취소되었어요', body: '라떼러버님이 주문을 취소했어요.', read: true, link: ROUTES.ORDERS, agoMin: 600 },
  { id: 'sn5', category: 'settlement', icon: '💰', title: '정산이 완료되었어요', body: '5월 2차 정산금이 입금되었어요.', read: true, link: ROUTES.SETTLEMENT, agoMin: 1440 },
  { id: 'sn6', category: 'order', icon: '✅', title: '픽업이 완료되었어요', body: '모닝콜님 · 베이글 외 1건 픽업 완료.', read: true, link: ROUTES.ORDERS, agoMin: 1560 },
  { id: 'sn7', category: 'notice', icon: '📢', title: '마감픽 운영정책 안내', body: '6월부터 적용되는 정산 정책을 확인해 주세요.', read: true, link: null, agoMin: 4320 },
]

function buildSeed(): Notification[] {
  const base = Date.now()
  return SEED.map(({ agoMin, ...rest }) => ({
    ...rest,
    createdAt: new Date(base - agoMin * 60_000).toISOString(),
  }))
}

let notifications: Notification[] = buildSeed()
let settings: NotificationSettings = { ...DEFAULT_SETTINGS }

export const notificationsApi = {
  /** 알림 목록 — 세그먼트 없이 최신순 단일 리스트 */
  async list(): Promise<Notification[]> {
    await delay(250)
    const sorted = [...notifications].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    return notificationListSchema.parse(sorted)
  },

  /** 미읽음 수 (헤더 뱃지) */
  async unreadCount(): Promise<number> {
    await delay(80)
    return notifications.filter((n) => !n.read).length
  },

  /** 단건 읽음 처리 (idempotent) */
  async markRead(id: string): Promise<void> {
    await delay(120)
    notifications = notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
  },

  /** 전체 읽음 처리 */
  async markAllRead(): Promise<void> {
    await delay(150)
    notifications = notifications.map((n) => ({ ...n, read: true }))
  },

  /** 알림 설정 조회 */
  async getSettings(): Promise<NotificationSettings> {
    await delay(150)
    return notificationSettingsSchema.parse(settings)
  },

  /** 알림 설정 토글 — 변경 후 최신 설정 반환 */
  async updateSetting(key: NotificationSettingKey, on: boolean): Promise<NotificationSettings> {
    await delay(120)
    settings = { ...settings, [key]: on }
    return notificationSettingsSchema.parse(settings)
  },
}

/** 테스트 전용 — 모듈 상태를 시드/기본값으로 리셋. 연동 PR 에서 제거. */
export function __resetNotificationsForTest(): void {
  notifications = buildSeed()
  settings = { ...DEFAULT_SETTINGS }
}
