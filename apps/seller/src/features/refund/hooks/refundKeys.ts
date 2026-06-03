/** 환불 도메인 queryKey 헬퍼 (state-convention §3) — inbox 목록 단일 화면 */
export const refundKeys = {
  all: ['refunds'] as const,
  list: (storeId: string) => [...refundKeys.all, storeId, 'list'] as const,
}
