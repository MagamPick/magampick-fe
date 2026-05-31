export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  WELCOME: '/welcome',

  // 로그인 후 메인 탭 (TabLayout 의 자식 라우트)
  MAP: '/map',
  ALL: '/all',
  FAVS: '/favs',
  ORDERS: '/orders',
  MYPAGE: '/mypage',

  // 매장 상세 + 매장 위치 (TabLayout 밖 풀스크린 — 바텀네비 없음)
  STORE_DETAIL: (id: string) => `/store/${id}`,
  STORE_LOCATION: (id: string) => `/store/${id}/location`,
} as const
