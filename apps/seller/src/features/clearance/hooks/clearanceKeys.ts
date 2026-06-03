/** 떨이(마감 할인) 도메인 queryKey 헬퍼 (state-convention §3) */
export const clearanceKeys = {
  all: ['clearances'] as const,
  list: (storeId: string) => [...clearanceKeys.all, storeId, 'list'] as const,
  detail: (id: string) => [...clearanceKeys.all, id, 'detail'] as const,
}
