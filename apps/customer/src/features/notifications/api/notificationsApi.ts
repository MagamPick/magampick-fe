import { ROUTES } from '@/shared/lib/routes'
import {
  notificationListSchema,
  notificationSettingsSchema,
  type Notification,
  type NotificationSegment,
  type NotificationSettingKey,
  type NotificationSettings,
} from '../types'

/**
 * ⚠️ Mock 스텁 — notification BE(BE 완료 NO)가 아직이라 가짜 응답.
 * 모듈 인메모리(`notifications`/`settings`)로 알림 저장·읽음·설정 토글을 흉내낸다(세션 내 유지).
 * 연동 PR 에서 각 함수 본문을 `apiClient` 호출 + Zod 응답 검증으로 교체(시그니처 유지).
 * `SEED`/`DEFAULT_SETTINGS`/`buildSeed`/`__resetNotificationsForTest` 는 그때 제거.
 *
 * 시각: 시드는 모듈 로드 시각 기준 `agoMin`(분) offset 으로 createdAt(ISO) 을 만들어 상대시각이
 * 안정적이다. 딥링크는 항상 존재하는 라우트로만 연결(깨짐 방지) — 연동 시 상세 화면으로 정밀화.
 */

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

/** 설정 기본값 — 거래·리뷰 ON, 광고성(이벤트·혜택·마케팅) OFF (정보통신망법 opt-in) */
const DEFAULT_SETTINGS: NotificationSettings = {
  nearbyDeal: true,
  favoriteStore: true,
  orderRefund: true,
  reviewReply: true,
  eventBenefit: false,
  marketing: false,
}

interface Seed extends Omit<Notification, 'createdAt'> {
  /** 모듈 로드 시각 기준 몇 분 전인지 */
  agoMin: number
}

const SEED: Seed[] = [
  { id: 'n1', category: 'deal', icon: '🔥', title: '단골 가게의 새 마감 할인!', body: '베이커리 브레드샵에 크루아상 세트가 50% 할인 중이에요.', read: false, link: ROUTES.HOME, agoMin: 0 },
  { id: 'n2', category: 'order', icon: '🛍️', title: '주문이 픽업 대기 중이에요', body: '베이커리 브레드샵 · 크루아상 세트를 매장에서 픽업하세요.', read: false, link: ROUTES.ORDERS, agoMin: 5 },
  { id: 'n3', category: 'deal', icon: '⏰', title: '마감 1시간 전!', body: '커피로스터스 합정의 시그니처 라떼가 곧 마감돼요.', read: false, link: ROUTES.HOME, agoMin: 20 },
  { id: 'n4', category: 'order', icon: '✅', title: '결제가 완료되었어요', body: '베이커리 브레드샵 · 크루아상 세트 4,500원', read: true, link: ROUTES.ORDERS, agoMin: 70 },
  { id: 'n5', category: 'review', icon: '💬', title: '사장님이 리뷰에 답글을 남겼어요', body: '“맛있게 드셔주셔서 감사해요! 또 들러주세요 🥐”', read: false, link: ROUTES.MY_REVIEWS, agoMin: 180 },
  { id: 'n6', category: 'benefit', icon: '🎁', title: '신규 가입 축하 쿠폰', body: '첫 주문에 쓸 수 있는 30% 할인 쿠폰이 발급되었어요.', read: false, link: ROUTES.EVENTS, agoMin: 1440 },
  { id: 'n7', category: 'order', icon: '↩️', title: '환불이 완료되었어요', body: '마카롱 공방 · 마카롱 6구 5,400원이 환불되었어요.', read: true, link: ROUTES.ORDERS, agoMin: 1560 },
  { id: 'n8', category: 'benefit', icon: '⏳', title: '쿠폰이 곧 만료돼요', body: '30% 할인 쿠폰이 3일 뒤 사라져요. 잊지 말고 사용하세요.', read: true, link: ROUTES.COUPONS, agoMin: 2880 },
  { id: 'n9', category: 'system', icon: '📢', title: '마감픽 이용 가이드', body: '픽업 코드를 받았다면 매장 마감 전까지 꼭 픽업해 주세요.', read: true, link: null, agoMin: 4320 },
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
  /** 알림 목록 — 세그먼트 필터(all/deal/order) + 최신순 */
  async list(segment: NotificationSegment = 'all'): Promise<Notification[]> {
    await delay(250)
    const filtered = segment === 'all' ? notifications : notifications.filter((n) => n.category === segment)
    const sorted = [...filtered].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
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
