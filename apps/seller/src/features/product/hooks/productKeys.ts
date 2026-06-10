/** 일반 상품 도메인 queryKey 헬퍼 (state-convention §3) */
export const productKeys = {
  all: ['products'] as const,
  list: (storeId: number | null) => [...productKeys.all, storeId, 'list'] as const,
  detail: (id: number) => [...productKeys.all, id, 'detail'] as const,
}
