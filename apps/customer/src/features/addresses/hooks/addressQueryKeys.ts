/** 주소 도메인 쿼리 키 팩토리 (state-convention) */
export const addressKeys = {
  all: ['addresses'] as const,
  list: () => [...addressKeys.all, 'list'] as const,
  search: (query: string) => [...addressKeys.all, 'search', query] as const,
}
