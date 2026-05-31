import type { ProfileStats as Stats } from '../types'

interface ProfileStatsProps {
  stats: Stats
}

/**
 * 마이페이지 통계 3분할 (프로토타입 25-mypage `.my-stats`).
 * 값은 mock (profileApi) — 주문/단골 도메인 연동 시 실데이터로 교체.
 */
export function ProfileStats({ stats }: ProfileStatsProps) {
  const items = [
    { value: `${stats.monthlySavings.toLocaleString('ko-KR')}원`, label: '이번 달 절약' },
    { value: `${stats.rescuedCount}개`, label: '구한 음식' },
    { value: `${stats.favoriteCount}곳`, label: '단골 가게' },
  ]
  return (
    <div className="mx-5 flex divide-x divide-border rounded-[14px] border border-border bg-card">
      {items.map((item) => (
        <div key={item.label} className="flex-1 px-2 py-[15px] text-center">
          <div className="text-[17px] font-extrabold text-primary">{item.value}</div>
          <div className="mt-1 text-[11px] font-semibold text-muted-foreground">{item.label}</div>
        </div>
      ))}
    </div>
  )
}
