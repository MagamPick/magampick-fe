/** 이벤트(쿠폰) 도메인 queryKey 헬퍼 (state-convention §3) */
export const eventKeys = {
  all: ['events'] as const,
  list: () => [...eventKeys.all, 'list'] as const,
}
