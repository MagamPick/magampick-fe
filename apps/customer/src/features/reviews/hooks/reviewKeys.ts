/** 리뷰 도메인 queryKey 헬퍼 (state-convention §3) */
export const reviewKeys = {
  all: ['reviews'] as const,
  myList: () => [...reviewKeys.all, 'my'] as const,
  reviewableOrders: () => [...reviewKeys.all, 'reviewable-orders'] as const,
  byOrder: (orderId: string) => [...reviewKeys.all, 'by-order', orderId] as const,
}
