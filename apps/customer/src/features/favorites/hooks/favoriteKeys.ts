/** 단골매장 도메인 쿼리 키 팩토리 (state-convention) */
export const favoriteKeys = {
  all: ['favorites'] as const,
  list: () => [...favoriteKeys.all, 'list'] as const,
}
