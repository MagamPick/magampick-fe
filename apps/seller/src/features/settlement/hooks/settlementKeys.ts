/** 정산 도메인 queryKey 헬퍼 (state-convention §3) — 회차 목록 + 이번 회차 요약 */
export const settlementKeys = {
  all: ['settlements'] as const,
  list: (storeId: string) => [...settlementKeys.all, storeId, 'list'] as const,
  summary: (storeId: string) => [...settlementKeys.all, storeId, 'summary'] as const,
}
