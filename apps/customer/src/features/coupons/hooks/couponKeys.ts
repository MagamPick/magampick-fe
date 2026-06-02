/** 쿠폰 queryKey (state-convention: 도메인 네임스페이스) */
export const couponKeys = {
  all: ['coupons'] as const,
  list: () => ['coupons', 'list'] as const,
  events: () => ['coupons', 'events'] as const,
}
