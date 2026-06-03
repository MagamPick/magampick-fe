/** 주문 도메인 queryKey 헬퍼 (state-convention §3) */
export const orderKeys = {
  all: ['orders'] as const,
  list: (storeId: string) => [...orderKeys.all, storeId, 'list'] as const,
  detail: (id: string) => [...orderKeys.all, id, 'detail'] as const,
}
