/** 일반 상품 도메인 queryKey 헬퍼 (state-convention §3) */
export const productKeys = {
  all: ['products'] as const,
  list: (storeId: string) => [...productKeys.all, storeId, 'list'] as const,
}
