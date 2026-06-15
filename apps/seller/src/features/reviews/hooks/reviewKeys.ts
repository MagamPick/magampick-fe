/** 리뷰 도메인 queryKey 헬퍼 (state-convention §3) */
export const reviewKeys = {
  all: ['reviews'] as const,
  list: (storeId: string) => [...reviewKeys.all, storeId, 'list'] as const,
}
