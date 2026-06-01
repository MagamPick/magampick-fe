/** 프로필(내 정보) 도메인 쿼리 키 팩토리 (state-convention) */
export const profileKeys = {
  all: ['profile'] as const,
  detail: () => [...profileKeys.all, 'detail'] as const,
}
