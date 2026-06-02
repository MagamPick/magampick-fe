/**
 * ISO 시각 → 상대 표현 (알림센터 시각 표시). 기준 시각(now)을 주입 가능(테스트 결정성).
 * 방금 전 / N분 전 / N시간 전 / 어제 / N일 전 / (7일 이상) M월 D일.
 */
export function formatRelativeTime(iso: string, now: number = Date.now()): string {
  const then = new Date(iso).getTime()
  const min = Math.floor((now - then) / 60_000)

  if (min < 1) return '방금 전'
  if (min < 60) return `${min}분 전`

  const hour = Math.floor(min / 60)
  if (hour < 24) return `${hour}시간 전`

  const day = Math.floor(hour / 24)
  if (day === 1) return '어제'
  if (day < 7) return `${day}일 전`

  const d = new Date(then)
  return `${d.getMonth() + 1}월 ${d.getDate()}일`
}
