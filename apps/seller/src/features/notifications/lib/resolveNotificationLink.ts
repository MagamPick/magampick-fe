import type { Notification } from '../types'

/**
 * 알림 클릭 시 이동할 경로 (하이브리드).
 *
 * 1순위 = BE `link` (건별 딥링크). 앱 내부 절대경로('/'로 시작)만 신뢰한다.
 * 2순위 = `category` 기반 화면 수준 라우트.
 *
 * 외부 URL(`https://…`)·빈 문자열·상대경로는 무시하고 category fallback 으로 —
 * react-router navigate 에 외부 URL 이 들어가 깨지는 것을 막는다. (B3-4)
 * firebase-messaging-sw.js 의 resolveNotificationLink 와 수동 동기화할 것.
 */
export function resolveNotificationLink(
  notification: Pick<Notification, 'category' | 'link'>,
): string | null {
  const { link, category } = notification
  if (isInternalPath(link)) return link
  return resolveNotificationRoute(category)
}

/** 앱 내부 절대경로 여부 — '/'로 시작하는 비어있지 않은 문자열만 true (외부 URL `//`·`/\` 제외) */
function isInternalPath(link: string | null | undefined): link is string {
  return typeof link === 'string' && /^\/(?![/\\])/.test(link)
}

function resolveNotificationRoute(category: string): string | null {
  switch (category) {
    case 'order':
      return '/orders'
    case 'refund':
      return '/refunds'
    case 'review':
      return '/reviews'
    case 'settlement':
      return '/settlement'
    case 'notice':
      return '/notices'
    default:
      return null
  }
}
