/** 매장 도메인 queryKey 헬퍼 (state-convention §3) */
export const storeKeys = {
  all: ['stores'] as const,
  list: () => [...storeKeys.all, 'list'] as const,
  status: (storeId: number) => [...storeKeys.all, storeId, 'status'] as const,
  businessHours: (storeId: number) => [...storeKeys.all, storeId, 'businessHours'] as const,
  detail: (storeId: number) => [...storeKeys.all, storeId, 'detail'] as const,
}
