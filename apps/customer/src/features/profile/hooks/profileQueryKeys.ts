/** 프로필(마이페이지) 도메인 쿼리 키 팩토리 (state-convention) */
export const profileKeys = {
  all: ['profile'] as const,
  detail: () => [...profileKeys.all, 'detail'] as const,
  stats: () => [...profileKeys.all, 'stats'] as const,
}
