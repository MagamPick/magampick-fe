import type { PointHistoryFilter } from '../types'

/** 포인트 queryKey (state-convention: 도메인 네임스페이스 + 파라미터) */
export const pointKeys = {
  all: ['points'] as const,
  summary: () => ['points', 'summary'] as const,
  history: (filter: PointHistoryFilter) => ['points', 'history', filter] as const,
}
